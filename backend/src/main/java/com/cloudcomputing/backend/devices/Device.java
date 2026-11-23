package com.cloudcomputing.backend.devices;

import java.time.Instant;
import java.util.UUID;

// Keep a device's stored identity independent of its current network address.
public record Device(UUID id, UUID groupId, String displayName, Instant registeredAt, Instant revokedAt) {}
