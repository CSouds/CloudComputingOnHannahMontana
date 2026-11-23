package com.cloudcomputing.backend.devices;

import java.time.Instant;
import java.util.UUID;

// Share a group member's public identity without credentials or revocation details.
// deviceType is laptop, desktop, or server, or null when unknown.
public record DeviceSummary(UUID id, String displayName, String deviceType, Instant registeredAt) {}
