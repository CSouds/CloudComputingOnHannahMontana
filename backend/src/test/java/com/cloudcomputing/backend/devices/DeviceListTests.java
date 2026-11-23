package com.cloudcomputing.backend.devices;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Use committed PostgreSQL records to verify that device listing is authenticated and group-scoped.
@SpringBootTest
@AutoConfigureMockMvc
class DeviceListTests {
    private static final Instant NOW = Instant.parse("2026-11-23T12:00:00Z");

    @Autowired private JdbcTemplate jdbc;
    @Autowired private MockMvc mvc;
    private UUID groupId;
    private UUID otherGroupId;

    // Give each test two committed groups so cross-group leaks would be visible.
    @BeforeEach
    void prepareGroups() {
        groupId = insertGroup("Device list test");
        otherGroupId = insertGroup("Other device list test");
    }

    // Remove only this test's records while leaving existing developer data untouched.
    @AfterEach
    void removeTestRecords() {
        for (UUID id : new UUID[] {groupId, otherGroupId}) {
            jdbc.update("DELETE FROM device_credentials WHERE device_id IN (SELECT id FROM devices WHERE group_id = ?)", id);
            jdbc.update("DELETE FROM devices WHERE group_id = ?", id);
            jdbc.update("DELETE FROM groups WHERE id = ?", id);
        }
    }

    // A registered device sees itself and its group's other members, but not other groups.
    @Test
    void listsOnlyCallersGroup() throws Exception {
        // Arrange
        var laptop = insertDevice(groupId, "Laptop", NOW);
        var desktop = insertDevice(groupId, "Desktop", NOW.plusSeconds(60));
        insertDevice(otherGroupId, "Stranger", NOW);

        // Act
        var response = list("Bearer " + laptop.token());

        // Assert
        response.andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.currentDeviceId").value(laptop.id().toString()))
                .andExpect(jsonPath("$.devices", hasSize(2)))
                .andExpect(jsonPath("$.devices[*].displayName", containsInAnyOrder("Laptop", "Desktop")))
                .andExpect(jsonPath("$.devices[1].id").value(desktop.id().toString()))
                .andExpect(content().string(not(containsString(laptop.token()))))
                .andExpect(content().string(not(containsString("tokenHash"))));
    }

    // Revoked devices should disappear from their group's listing.
    @Test
    void excludesRevokedDevices() throws Exception {
        // Arrange
        var laptop = insertDevice(groupId, "Laptop", NOW);
        var retired = insertDevice(groupId, "Retired", NOW);
        jdbc.update("UPDATE devices SET revoked_at = ? WHERE id = ?", Timestamp.from(NOW), retired.id());

        // Act
        var response = list("Bearer " + laptop.token());

        // Assert
        response.andExpect(status().isOk())
                .andExpect(jsonPath("$.devices", hasSize(1)))
                .andExpect(jsonPath("$.devices[0].displayName").value("Laptop"));
    }

    // A revoked credential must not authenticate, even though its device is still active.
    @Test
    void rejectsRevokedCredential() throws Exception {
        // Arrange
        var laptop = insertDevice(groupId, "Laptop", NOW);
        jdbc.update("UPDATE device_credentials SET revoked_at = ? WHERE device_id = ?", Timestamp.from(NOW), laptop.id());

        // Act
        var response = list("Bearer " + laptop.token());

        // Assert
        response.andExpect(status().isUnauthorized());
    }

    // A revoked device must not authenticate with its otherwise active credential.
    @Test
    void rejectsRevokedDevice() throws Exception {
        // Arrange
        var laptop = insertDevice(groupId, "Laptop", NOW);
        jdbc.update("UPDATE devices SET revoked_at = ? WHERE id = ?", Timestamp.from(NOW), laptop.id());

        // Act
        var response = list("Bearer " + laptop.token());

        // Assert
        response.andExpect(status().isUnauthorized());
    }

    // Missing, malformed, and unknown tokens all return the same safe authentication error.
    @ParameterizedTest(name = "Authorization \"{0}\" returns HTTP 401")
    @ValueSource(strings = {"", "Bearer ", "Basic abc", "Bearer short",
            "Bearer AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"})
    void rejectsInvalidAuthorization(String authorization) throws Exception {
        // Arrange
        insertDevice(groupId, "Laptop", NOW);

        // Act
        var response = list(authorization);

        // Assert
        response.andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.detail").value("Device token is missing, invalid, or revoked."));
    }

    // Requests without any Authorization header must be rejected as unauthenticated, not malformed.
    @Test
    void rejectsMissingAuthorizationHeader() throws Exception {
        // Arrange
        insertDevice(groupId, "Laptop", NOW);

        // Act
        var response = mvc.perform(get("/devices"));

        // Assert
        response.andExpect(status().isUnauthorized());
    }

    // The local UI must be allowed to send its token to the device list from the browser.
    @Test
    void allowsLocalUiPreflight() throws Exception {
        // Arrange
        String origin = "http://localhost:3000";

        // Act
        var response = mvc.perform(options("/devices")
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization"));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin));
    }

    // Unlisted sites must not be able to read the device list from a visitor's browser.
    @Test
    void rejectsUnknownOriginPreflight() throws Exception {
        // Arrange
        String origin = "http://evil.example";

        // Act
        var response = mvc.perform(options("/devices")
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"));

        // Assert
        response.andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    // Exercise header handling and JSON serialization through MVC with the real service.
    private ResultActions list(String authorization) throws Exception {
        return mvc.perform(get("/devices").header(HttpHeaders.AUTHORIZATION, authorization));
    }

    // Prepare group state directly so listing tests do not depend on admin commands.
    private UUID insertGroup(String name) {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO groups (id, name, created_at) VALUES (?, ?, ?)", id, name, Timestamp.from(NOW));
        return id;
    }

    // Insert a device with an active credential, returning the usable token as an agent would hold it.
    private DeviceFixture insertDevice(UUID group, String name, Instant registeredAt) throws Exception {
        UUID id = UUID.randomUUID();
        String token = UUID.randomUUID().toString().replace("-", "") + "fixture0000";
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8)));
        jdbc.update("INSERT INTO devices (id, group_id, display_name, registered_at) VALUES (?, ?, ?, ?)",
                id, group, name, Timestamp.from(registeredAt));
        jdbc.update("INSERT INTO device_credentials (id, device_id, token_hash, created_at) VALUES (?, ?, ?, ?)",
                UUID.randomUUID(), id, hash, Timestamp.from(registeredAt));
        return new DeviceFixture(id, token);
    }

    // Keep test device values independent of the application's internal types.
    private record DeviceFixture(UUID id, String token) {}
}
