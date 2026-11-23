package com.cloudcomputing.backend.groups;

import java.time.Instant;
import java.util.UUID;

// Represent a stored group without ORM mappings or mutable persistence state.
public record DeviceGroup(UUID id, String name, Instant createdAt) {}
