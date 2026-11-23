package com.cloudcomputing.backend.errors.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import com.cloudcomputing.backend.errors.exceptions.InvalidDeviceTokenException;
import com.cloudcomputing.backend.errors.exceptions.InvalidInvitationException;

// Keep API error responses consistent while preserving Spring's built-in HTTP statuses.
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Return an authorization failure without revealing which invitation check failed.
    @ExceptionHandler(InvalidInvitationException.class)
    public ProblemDetail handleInvalidInvitation(InvalidInvitationException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, exception.getMessage());
    }

    // Return an authentication failure without revealing which token check failed.
    @ExceptionHandler(InvalidDeviceTokenException.class)
    public ProblemDetail handleInvalidDeviceToken(InvalidDeviceTokenException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
    }

    // Return a safe JSON error to clients and retain debugging details in server logs.
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpectedException(Exception exception) {
        log.error("Unhandled API exception", exception);
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred."
            );
    }
}
