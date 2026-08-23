package com.adelevate.clients;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;

// Sends "payment done" events to the standalone .NET logging microservice,
// which appends them to a .txt file. Best-effort only — WebClient's call is
// non-blocking and subscribe() is fire-and-forget, so a logging failure (or
// the .NET service just not being up) can never delay or break a real
// payment flow; it only reaches the warning log below.
@Service
@RequiredArgsConstructor
public class LoggingServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(LoggingServiceClient.class);
    private static final String LOGGING_SERVICE_URL = "http://localhost:5085/api/logs";
    private static final String SOURCE = "payment-service";

    private final WebClient webClient;

    public void logEvent(String eventType, String message, Long userId, String email) {
        Map<String, Object> body = new HashMap<>();
        body.put("eventType", eventType);
        body.put("message", message);
        body.put("userId", userId);
        body.put("email", email);
        body.put("source", SOURCE);

        webClient.post()
                .uri(LOGGING_SERVICE_URL)
                .bodyValue(body)
                .retrieve()
                .toBodilessEntity()
                .subscribe(
                        response -> { /* fire-and-forget: success needs no handling */ },
                        error -> LOG.warn("Could not reach logging service for event {}: {}", eventType, error.getMessage())
                );
    }
}
