package com.cloudcomputing.backend.devices;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DeviceRepository {
    private final JdbcTemplate jdbc;

    // Keep registration SQL explicit instead of relying on generated persistence methods.
    public DeviceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Persist the backend-assigned identity; insertion failures roll back the entire enrollment.
    public void insert(Device device) {
        jdbc.update("""
                INSERT INTO devices (id, group_id, display_name, device_type, registered_at)
                VALUES (?, ?, ?, ?, ?)
                """, device.id(), device.groupId(), device.displayName(), device.deviceType(),
                Timestamp.from(device.registeredAt()));
    }

    // Authenticate through an active credential that belongs to a device that is still active.
    public Optional<Device> findActiveByTokenHash(String tokenHash) {
        return jdbc.query("""
                SELECT d.id, d.group_id, d.display_name, d.device_type, d.registered_at, d.revoked_at
                FROM devices d
                JOIN device_credentials c ON c.device_id = d.id
                WHERE c.token_hash = ? AND c.revoked_at IS NULL AND d.revoked_at IS NULL
                """, DeviceRepository::mapDevice, tokenHash).stream().findFirst();
    }

    // List a group's active members in a stable order for display.
    public List<Device> findActiveByGroupId(UUID groupId) {
        return jdbc.query("""
                SELECT id, group_id, display_name, device_type, registered_at, revoked_at
                FROM devices
                WHERE group_id = ? AND revoked_at IS NULL
                ORDER BY registered_at, id
                """, DeviceRepository::mapDevice, groupId);
    }

    // Convert one devices row into the shared record used by registration and listing.
    private static Device mapDevice(ResultSet row, int index) throws SQLException {
        var revokedAt = row.getTimestamp("revoked_at");
        return new Device(row.getObject("id", UUID.class), row.getObject("group_id", UUID.class),
                row.getString("display_name"), row.getString("device_type"),
                row.getTimestamp("registered_at").toInstant(),
                revokedAt == null ? null : revokedAt.toInstant());
    }
}
