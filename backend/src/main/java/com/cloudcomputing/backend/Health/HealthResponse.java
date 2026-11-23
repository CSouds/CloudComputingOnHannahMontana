package com.cloudcomputing.backend.Health;

// Keep the health JSON contract explicit for clients.
public record HealthResponse(String status) {}
