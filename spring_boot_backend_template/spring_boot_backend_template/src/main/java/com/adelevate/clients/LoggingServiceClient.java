package com.adelevate.clients;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

// Sends login/register events to the standalone .NET logging microservice,
// which appends them to a .txt file. This is best-effort only: a failure
// here (or the .NET service simply not being up) must never break login or
// registration for the person using the app — every call is wrapped so it
// can only log a warning, never throw.
@Service
@RequiredArgsConstructor
public class LoggingServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(LoggingServiceClient.class);
    private static final String SOURCE = "core-service";

    private final RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${logging.service.url}")
    private String loggingServiceUrl;

    public void logEvent(String eventType, String message, Long userId, String email) {
        Map<String, Object> body = new HashMap<>();
        body.put("eventType", eventType);
        body.put("message", message);
        body.put("userId", userId);
        body.put("email", email);
        body.put("source", SOURCE);

        try {
            restTemplate.postForObject(loggingServiceUrl + "/api/logs", body, String.class);
        } catch (Exception e) {
            LOG.warn("Could not reach logging service for event {}: {}", eventType, e.getMessage());
        }
    }
}
