package com.cloudcomputing.backend.devices;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
}
