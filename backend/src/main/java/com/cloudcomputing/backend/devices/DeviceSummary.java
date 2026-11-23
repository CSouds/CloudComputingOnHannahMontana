package com.cloudcomputing.backend.devices;

import java.time.Instant;
import java.util.UUID;

// Share a group member's public identity without credentials or revocation details.
public record DeviceSummary(UUID id, String displayName, Instant registeredAt) {}
