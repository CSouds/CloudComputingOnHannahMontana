package com.cloudcomputing.backend.invitations;

import java.time.Instant;
import java.util.UUID;

// Describe a persisted invitation using IDs and timestamps without mutable entity state.
public record RegistrationInvitation(UUID id, UUID groupId, String tokenHash,
        Instant createdAt, Instant expiresAt, Instant consumedAt) {}
