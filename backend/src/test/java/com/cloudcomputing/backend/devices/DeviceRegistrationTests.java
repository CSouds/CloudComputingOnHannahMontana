package com.cloudcomputing.backend.devices;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Use committed PostgreSQL transactions to verify HTTP behavior, rollback, and concurrent enrollment.
@SpringBootTest
@AutoConfigureMockMvc
@Import(DeviceRegistrationTests.FixedTime.class)
class DeviceRegistrationTests {
    private static final Instant NOW = Instant.parse("2026-11-23T12:00:00Z");

    @Autowired private JdbcTemplate jdbc;
    @Autowired private MockMvc mvc;
    private UUID groupId;
    private InvitationFixture invitation;

    // Give each test its own committed group and invitation without consuming a developer's token.
    @BeforeEach
    void prepareRegistration() throws Exception {
        groupId = UUID.randomUUID();
        jdbc.update("INSERT INTO groups (id, name, created_at) VALUES (?, ?, ?)",
                groupId, "Registration test", Timestamp.from(NOW));
        invitation = createInvitation();
    }

    // Remove only this test's records while leaving existing developer data untouched.
    @AfterEach
    void removeTestRecords() {
        if (groupId != null) {
            jdbc.update("DELETE FROM device_credentials WHERE device_id IN (SELECT id FROM devices WHERE group_id = ?)", groupId);
            jdbc.update("DELETE FROM devices WHERE group_id = ?", groupId);
            jdbc.update("DELETE FROM registration_invitations WHERE group_id = ?", groupId);
            jdbc.update("DELETE FROM groups WHERE id = ?", groupId);
        }
    }

    // A successful response must correspond to a committed device, a hashed credential, and a consumed invitation.
    @Test
    void registersDeviceAndReturnsCredentialOnce() throws Exception {
        // Arrange
        String displayName = " Desktop ";

        // Act
        var result = register(displayName, invitation.token())
                .andExpect(status().isCreated()).andReturn();
        String body = result.getResponse().getContentAsString();
        String deviceToken = JsonPath.read(body, "$.deviceToken");
        UUID deviceId = UUID.fromString(JsonPath.read(body, "$.deviceId"));

        // Assert
        assertEquals(4, deviceId.version());
        assertEquals(groupId.toString(), JsonPath.read(body, "$.groupId"));
        assertTrue(deviceToken.matches("[A-Za-z0-9_-]{43}"));
        assertFalse(body.contains(invitation.token()));
        assertFalse(body.contains("tokenHash"));
        assertEquals("Desktop", jdbc.queryForObject("SELECT display_name FROM devices WHERE id = ?", String.class, deviceId));
        assertEquals(groupId, jdbc.queryForObject("SELECT group_id FROM devices WHERE id = ?", UUID.class, deviceId));
        String expectedHash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(deviceToken.getBytes(StandardCharsets.UTF_8)));
        assertEquals(expectedHash, jdbc.queryForObject("SELECT token_hash FROM device_credentials WHERE device_id = ?", String.class, deviceId));
        assertNotNull(jdbc.queryForObject("SELECT consumed_at FROM registration_invitations WHERE id = ?", Timestamp.class, invitation.id()));
    }

    // A token that was never issued must not create a device or reveal token details in its error.
    @Test
    void rejectsUnknownInvitation() throws Exception {
        // Arrange
        String unknownToken = "A".repeat(43);

        // Act
        var response = register("Desktop", unknownToken);

        // Assert
        response.andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Invitation is invalid, expired, or already used."));
        assertEquals(0, deviceCount());
    }

    // Expiration is exclusive: a token is unusable at its deadline, without waiting in the test.
    @Test
    void rejectsInvitationAtExpiration() throws Exception {
        // Arrange
        jdbc.update("UPDATE registration_invitations SET created_at = ?, expires_at = ? WHERE id = ?",
                Timestamp.from(NOW.minusSeconds(600)), Timestamp.from(NOW), invitation.id());

        // Act
        var response = register("Desktop", invitation.token());

        // Assert
        response.andExpect(status().isForbidden());
        assertEquals(0, deviceCount());
        assertNull(jdbc.queryForObject("SELECT consumed_at FROM registration_invitations WHERE id = ?", Timestamp.class, invitation.id()));
    }

    // Successful enrollment must prevent the same invitation from enrolling another device.
    @Test
    void rejectsInvitationReuse() throws Exception {
        // Arrange
        register("First device", invitation.token()).andExpect(status().isCreated());

        // Act
        var response = register("Second device", invitation.token());

        // Assert
        response.andExpect(status().isForbidden());
        assertEquals(1, deviceCount());
    }

    // Independent invitations must receive different identities without replacing earlier credentials.
    @Test
    void assignsDistinctDeviceIdsForSeparateRegistrations() throws Exception {
        // Arrange
        var secondInvitation = createInvitation();

        // Act
        String firstBody = register("Desktop", invitation.token())
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        String secondBody = register("Desktop", secondInvitation.token())
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();

        // Assert
        UUID firstId = UUID.fromString(JsonPath.read(firstBody, "$.deviceId"));
        UUID secondId = UUID.fromString(JsonPath.read(secondBody, "$.deviceId"));
        assertNotEquals(firstId, secondId);
        assertEquals(2, deviceCount());
        assertEquals(2, jdbc.queryForObject("SELECT count(*) FROM device_credentials WHERE device_id IN (?, ?)",
                Integer.class, firstId, secondId));
    }

    // Bad input should return a client error before it can consume an invitation.
    @Test
    void rejectsBlankNameWithoutConsumingInvitation() throws Exception {
        // Arrange
        String displayName = "   ";

        // Act
        var response = register(displayName, invitation.token());

        // Assert
        response.andExpect(status().isBadRequest());
        assertEquals(0, deviceCount());
        register("Valid name", invitation.token()).andExpect(status().isCreated());
    }

    // Names beyond the storage limit must be rejected before consuming the invitation.
    @Test
    void rejectsOverlongName() throws Exception {
        // Arrange
        String name = "A".repeat(256);

        // Act
        var response = register(name, invitation.token());

        // Assert
        response.andExpect(status().isBadRequest());
        assertEquals(0, deviceCount());
        register("Valid name", invitation.token()).andExpect(status().isCreated());
    }

    // Two simultaneous requests must produce exactly one enrollment for a single-use invitation.
    @Test
    void concurrentRequestsCannotReuseInvitation() throws Exception {
        // Arrange
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> registerConcurrently(start, invitation.token()));
            var second = executor.submit(() -> registerConcurrently(start, invitation.token()));

            // Act
            start.countDown();
            var statuses = List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS));

            // Assert
            assertTrue(statuses.containsAll(List.of(201, 403)));
            assertEquals(1, deviceCount());
        }
    }

    // Independent invitations must both enroll successfully, even when the names and timing match.
    @Test
    void concurrentInvitationsCreateDistinctDevices() throws Exception {
        // Arrange
        var secondInvitation = createInvitation();
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> registerConcurrently(start, invitation.token()));
            var second = executor.submit(() -> registerConcurrently(start, secondInvitation.token()));

            // Act
            start.countDown();
            var statuses = List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS));

            // Assert
            assertEquals(List.of(201, 201), statuses);
            assertEquals(2, deviceCount());
            assertEquals(2, jdbc.queryForObject("SELECT count(DISTINCT id) FROM devices WHERE group_id = ?", Integer.class, groupId));
            assertEquals(2, jdbc.queryForObject("SELECT count(*) FROM registration_invitations WHERE group_id = ? AND consumed_at IS NOT NULL", Integer.class, groupId));
        }
    }

    // Exercise request validation and JSON serialization through MVC with the real transactional service.
    private ResultActions register(String displayName, String token) throws Exception {
        String body = JsonMapper.builder().build().writeValueAsString(Map.of(
                "displayName", displayName, "invitationToken", token));
        return mvc.perform(post("/devices/register").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    // Count only this test's registrations so existing developer devices do not affect assertions.
    private int deviceCount() {
        return jdbc.queryForObject("SELECT count(*) FROM devices WHERE group_id = ?", Integer.class, groupId);
    }

    // Exercise concurrent registration through HTTP rather than bypassing request handling.
    private int registerConcurrently(CountDownLatch start, String token) throws Exception {
        start.await();
        return register("Concurrent device", token).andReturn().getResponse().getStatus();
    }

    // Each required request field must be enforced before registration changes database state.
    @ParameterizedTest(name = "Missing {0} returns HTTP 400")
    @ValueSource(strings = {"displayName", "invitationToken"})
    void rejectsMissingRequiredField(String field) throws Exception {
        // Arrange
        var request = new HashMap<>(Map.of(
                "displayName", "Desktop", "invitationToken", invitation.token()));
        request.remove(field);
        String body = JsonMapper.builder().build().writeValueAsString(request);

        // Act
        var response = mvc.perform(post("/devices/register").contentType(MediaType.APPLICATION_JSON).content(body));

        // Assert
        response.andExpect(status().isBadRequest());
        assertEquals(0, deviceCount());
        register("Valid request", invitation.token()).andExpect(status().isCreated());
    }

    // Malformed JSON should be a useful client error rather than an unhandled server error.
    @Test
    void rejectsMalformedJson() throws Exception {
        // Arrange
        String body = "{\"displayName\":";

        // Act
        var response = mvc.perform(post("/devices/register").contentType(MediaType.APPLICATION_JSON).content(body));

        // Assert
        response.andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
        assertEquals(0, deviceCount());
    }

    // Registration must remain a POST operation rather than accepting accidental GET requests.
    @Test
    void getRegistrationReturnsMethodNotAllowed() throws Exception {
        // Arrange
        String path = "/devices/register";

        // Act
        var response = mvc.perform(get(path));

        // Assert
        response.andExpect(status().isMethodNotAllowed());
        assertEquals(0, deviceCount());
    }

    // Prepare valid enrollment state directly so endpoint tests do not depend on admin/service APIs.
    private InvitationFixture createInvitation() throws Exception {
        UUID id = UUID.randomUUID();
        String token = UUID.randomUUID().toString().replace("-", "") + "fixture0000";
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8)));
        jdbc.update("""
                INSERT INTO registration_invitations (id, group_id, token_hash, created_at, expires_at)
                VALUES (?, ?, ?, ?, ?)
                """, id, groupId, hash, Timestamp.from(NOW), Timestamp.from(NOW.plusSeconds(600)));
        return new InvitationFixture(id, token);
    }

    // Keep test invitation values independent of the application's internal response types.
    private record InvitationFixture(UUID id, String token) {}

    @TestConfiguration
    static class FixedTime {
        // Keep expiration boundaries deterministic across all registration tests.
        @Bean
        @Primary
        Clock testClock() {
            return Clock.fixed(NOW, ZoneOffset.UTC);
        }
    }
}
