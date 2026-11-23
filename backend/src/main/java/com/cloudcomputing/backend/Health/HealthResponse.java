package com.cloudcomputing.backend.health;

// Keep the health JSON contract explicit for clients.
public record HealthResponse(String status) {}
