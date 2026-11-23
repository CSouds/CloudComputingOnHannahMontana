package com.cloudcomputing.backend.devices;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Accept enrollment details while the backend assigns device identity and group membership.
public record RegisterDeviceRequest(
        @NotBlank @Size(max = 255) String displayName,
        @NotNull @Pattern(regexp = "[A-Za-z0-9_-]{43}") String invitationToken,
        // Optional so agents that don't report a type can still register; must match the database check.
        @Pattern(regexp = "laptop|desktop|server") String deviceType) {

    // Keep enrollment secrets out of incidental request logging.
    @Override
    public String toString() {
        return "RegisterDeviceRequest[invitationToken=[REDACTED]]";
    }
}
