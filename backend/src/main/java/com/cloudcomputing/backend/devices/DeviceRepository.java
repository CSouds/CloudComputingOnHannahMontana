package com.cloudcomputing.backend.devices;

import java.sql.Timestamp;

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
                INSERT INTO devices (id, group_id, display_name, registered_at)
                VALUES (?, ?, ?, ?)
                """, device.id(), device.groupId(), device.displayName(),
                Timestamp.from(device.registeredAt()));
    }
}
