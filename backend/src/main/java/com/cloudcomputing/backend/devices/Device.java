package com.cloudcomputing.backend.devices;

import java.time.Instant;
import java.util.UUID;

// Keep a device's stored identity independent of its current network address.
// deviceType is laptop, desktop, or server, or null when the device did not report one.
public record Device(UUID id, UUID groupId, String displayName, String deviceType,
        Instant registeredAt, Instant revokedAt) {}
