package com.cloudcomputing.backend.health;

import com.cloudcomputing.backend.errors.handlers.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class HealthEndpointTests {

    // Clients can check API availability through JSON without a database connection.
    @Test
    void getHealthReturnsOkJson() throws Exception {
        // Arrange
        var mvc = MockMvcBuilders.standaloneSetup(new HealthController(new HealthService()))
                .setControllerAdvice(new GlobalExceptionHandler()).build();

        // Act
        var response = mvc.perform(get("/health"));

        // Assert
        response.andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(content().json("{\"status\":\"ok\"}"));
    }

    // Health is a read operation; unsupported methods should remain client errors.
    @Test
    void postHealthReturnsMethodNotAllowed() throws Exception {
        // Arrange
        var mvc = MockMvcBuilders.standaloneSetup(new HealthController(new HealthService()))
                .setControllerAdvice(new GlobalExceptionHandler()).build();

        // Act
        var response = mvc.perform(post("/health"));

        // Assert
        response.andExpect(status().isMethodNotAllowed())
                .andExpect(header().string("Allow", containsString("GET")))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(405));
    }

    // Failures on a real public endpoint should return safe JSON rather than internal diagnostics.
    @Test
    void unexpectedFailureReturnsGenericJsonError() throws Exception {
        // Arrange
        var failingService = new HealthService() {
            // Reproduce a dependency failure without adding a failure route to the API.
            @Override
            public HealthResponse getHealth() {
                throw new IllegalStateException("Private internal diagnostics");
            }
        };
        var mvc = MockMvcBuilders.standaloneSetup(new HealthController(failingService))
                .setControllerAdvice(new GlobalExceptionHandler()).build();

        // Act
        var response = mvc.perform(get("/health"));

        // Assert
        response.andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.detail").value("An unexpected error occurred."))
                .andExpect(content().string(not(containsString("Private internal diagnostics"))))
                .andExpect(jsonPath("$.stackTrace").doesNotExist());
    }
}
