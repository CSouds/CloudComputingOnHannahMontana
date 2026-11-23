package com.cloudcomputing.backend.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    private final String[] allowedOrigins;

    // Read the browser origins allowed to call the API from configuration rather than hardcoding them.
    public CorsConfig(@Value("${app.cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    // Let the local UI read the device list; registration stays limited to the agent, which is not a browser.
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/devices")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET")
                .allowedHeaders("Authorization");
    }
}
