package com.cloudcomputing.backend.credentials;

import java.sql.Timestamp;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DeviceCredentialRepository {
    private final JdbcTemplate jdbc;

    // Share registration's JDBC connection when saving the new credential hash.
    public DeviceCredentialRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Persist only the hash so database access does not reveal the device's bearer token.
    public void insert(DeviceCredential credential) {
        jdbc.update("""
                INSERT INTO device_credentials (id, device_id, token_hash, created_at)
                VALUES (?, ?, ?, ?)
                """, credential.id(), credential.deviceId(), credential.tokenHash(),
                Timestamp.from(credential.createdAt()));
    }
}
