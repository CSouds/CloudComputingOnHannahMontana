package com.cloudcomputing.backend.errors.exceptions;

// Use one public message for missing, unknown, and revoked device tokens without exposing the token.
public class InvalidDeviceTokenException extends RuntimeException {
    public InvalidDeviceTokenException() {
        super("Device token is missing, invalid, or revoked.");
    }
}
