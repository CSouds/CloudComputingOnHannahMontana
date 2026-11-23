package com.cloudcomputing.backend.devices;

import java.util.List;
import java.util.UUID;

// Identify the requesting device so agents can label "This device" among its group's members.
public record GroupDevicesResponse(UUID currentDeviceId, List<DeviceSummary> devices) {}
