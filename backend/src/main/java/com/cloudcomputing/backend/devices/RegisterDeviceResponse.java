package com.cloudcomputing.backend.devices;

import java.util.UUID;

// Return the new credential once without exposing database entities or stored hashes.
public record RegisterDeviceResponse(UUID deviceId, UUID groupId, String deviceToken) {
    // Keep the usable credential out of incidental response logging.
    @Override
    public String toString() {
        return "RegisterDeviceResponse[deviceId=" + deviceId + ", groupId=" + groupId + ", deviceToken=[REDACTED]]";
    }
}
