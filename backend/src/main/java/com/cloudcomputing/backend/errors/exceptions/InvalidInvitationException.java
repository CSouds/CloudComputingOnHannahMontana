package com.cloudcomputing.backend.errors.exceptions;

// Use one public message for unknown, expired, and consumed invitations without exposing the token.
public class InvalidInvitationException extends RuntimeException {
    public InvalidInvitationException() {
        super("Invitation is invalid, expired, or already used.");
    }
}
