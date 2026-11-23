package com.cloudcomputing.backend.credentials;

import java.time.Instant;
import java.util.UUID;

// Store credential hashes with device IDs rather than usable tokens or ORM relationships.
public record DeviceCredential(UUID id, UUID deviceId, String tokenHash, Instant createdAt, Instant revokedAt) {}
