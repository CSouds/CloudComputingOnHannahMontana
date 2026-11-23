package com.cloudcomputing.backend.groups;

import java.sql.Timestamp;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class GroupRepository {
    private final JdbcTemplate jdbc;

    // Use parameterized SQL for the group's database operations.
    public GroupRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Persist a new group without silently updating an existing identity.
    public void insert(DeviceGroup group) {
        jdbc.update("INSERT INTO groups (id, name, created_at) VALUES (?, ?, ?)",
                group.id(), group.name(), Timestamp.from(group.createdAt()));
    }

    // Read the group needed for enrollment checks and administrator results.
    public Optional<DeviceGroup> findById(UUID id) {
        return jdbc.query("SELECT id, name, created_at FROM groups WHERE id = ?",
                (row, index) -> new DeviceGroup(row.getObject("id", UUID.class),
                        row.getString("name"), row.getTimestamp("created_at").toInstant()), id)
                .stream().findFirst();
    }
}
