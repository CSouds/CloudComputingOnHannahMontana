package com.cloudcomputing.backend.groups;

import java.time.Clock;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class GroupService {
    private final GroupRepository groups;
    private final Clock clock;

    // Share persistence and time handling across administrative group operations.
    public GroupService(GroupRepository groups, Clock clock) {
        this.groups = groups;
        this.clock = clock;
    }

    // Reject unusable names before creating a persistent group for device enrollment.
    public DeviceGroup createGroup(String name) {
        if (name == null || name.isBlank() || name.strip().length() > 255) {
            throw new IllegalArgumentException("Group name must contain 1 to 255 characters.");
        }
        var group = new DeviceGroup(UUID.randomUUID(), name.strip(), clock.instant());
        groups.insert(group);
        return group;
    }
}
