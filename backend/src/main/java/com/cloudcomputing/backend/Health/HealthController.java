package com.cloudcomputing.backend.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final HealthService healthService;

    // Receive the health service so HTTP handling stays separate from status logic.
    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    // Return a JSON status so clients can confirm the API is responding.
    @GetMapping("/health")
    public HealthResponse health() {
        return healthService.getHealth();
    }
}
