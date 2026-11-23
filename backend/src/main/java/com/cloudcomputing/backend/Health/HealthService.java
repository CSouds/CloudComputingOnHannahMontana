package com.cloudcomputing.backend.health;

import org.springframework.stereotype.Service;

@Service
public class HealthService {

    // Report API availability without requiring a database or other dependencies.
    public HealthResponse getHealth() {
        return new HealthResponse("ok");
    }
}
