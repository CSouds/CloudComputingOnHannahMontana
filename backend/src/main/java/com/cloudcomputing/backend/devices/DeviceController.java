package com.cloudcomputing.backend.devices;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/devices")
public class DeviceController {
    private final DeviceService devices;

    // Keep HTTP enrollment separate from transactional registration logic.
    public DeviceController(DeviceService devices) {
        this.devices = devices;
    }

    // Enroll agents using an invitation instead of exposing administrator provisioning operations.
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterDeviceResponse registerDevice(@Valid @RequestBody RegisterDeviceRequest request) {
        return devices.registerDevice(request);
    }

    // List the caller's group; a missing header reaches the service so it returns 401, not 400.
    @GetMapping
    public GroupDevicesResponse listGroupDevices(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization) {
        return devices.listGroupDevices(authorization);
    }
}
