package com.cloudcomputing.backend.invitations;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class InvitationRepository {
    private final JdbcTemplate jdbc;

    // Keep invitation storage and redemption in straightforward PostgreSQL statements.
    public InvitationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Save the invitation hash and deadline without retaining the usable token.
    public void insert(RegistrationInvitation invitation) {
        jdbc.update("""
                INSERT INTO registration_invitations (id, group_id, token_hash, created_at, expires_at)
                VALUES (?, ?, ?, ?, ?)
                """, invitation.id(), invitation.groupId(), invitation.tokenHash(),
                Timestamp.from(invitation.createdAt()), Timestamp.from(invitation.expiresAt()));
    }

    // Return persisted invitation details without exposing its original token.
    public Optional<RegistrationInvitation> findById(UUID id) {
        return jdbc.query("""
                SELECT id, group_id, token_hash, created_at, expires_at, consumed_at
                FROM registration_invitations WHERE id = ?
                """, (row, index) -> {
                    var consumedAt = row.getTimestamp("consumed_at");
                    return new RegistrationInvitation(row.getObject("id", UUID.class),
                            row.getObject("group_id", UUID.class), row.getString("token_hash"),
                            row.getTimestamp("created_at").toInstant(), row.getTimestamp("expires_at").toInstant(),
                            consumedAt == null ? null : consumedAt.toInstant());
                }, id).stream().findFirst();
    }

    // One conditional update prevents concurrent reuse; registration rolls it back if later work fails.
    public Optional<UUID> consume(String tokenHash, Instant now) {
        return jdbc.query("""
                UPDATE registration_invitations SET consumed_at = ?
                WHERE token_hash = ? AND consumed_at IS NULL AND expires_at > ?
                RETURNING group_id
                """, (row, index) -> row.getObject("group_id", UUID.class),
                Timestamp.from(now), tokenHash, Timestamp.from(now)).stream().findFirst();
    }
}
