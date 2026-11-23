package com.cloudcomputing.backend.errors.handlers;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTests {

    // Clients receive a generic JSON error instead of internal failure details.
    @Test
    void unexpectedFailureReturnsSafeJsonError() throws Exception {
        // Arrange
        var mvc = MockMvcBuilders.standaloneSetup(new FailingController())
                .setControllerAdvice(new GlobalExceptionHandler()).build();

        // Act
        var response = mvc.perform(get("/failure"));

        // Assert
        response.andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.detail").value("An unexpected error occurred."));
    }

    // Invalid HTTP methods must remain client errors rather than becoming server failures.
    @Test
    void unsupportedMethodRetainsMethodNotAllowedStatus() throws Exception {
        // Arrange
        var mvc = MockMvcBuilders.standaloneSetup(new FailingController())
                .setControllerAdvice(new GlobalExceptionHandler()).build();

        // Act
        var response = mvc.perform(post("/failure"));

        // Assert
        response.andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405));
    }

    @RestController
    static class FailingController {

        // Trigger an unhandled failure without adding a failure endpoint to the application.
        @GetMapping("/failure")
        public String fail() {
            throw new IllegalStateException("Internal details that clients must not receive");
        }
    }
}
