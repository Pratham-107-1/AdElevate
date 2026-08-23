package com.adelevate.clients;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.RequiredArgsConstructor;

// Sends login/register events to the standalone .NET logging microservice,
// which appends them to a .txt file. This is best-effort only: a failure
// here (or the .NET service simply not being up) must never break login or
// registration for the person using the app. WebClient's call is
// non-blocking and subscribe() is fire-and-forget — the request thread
// never waits on the logging service, and any error only reaches the
// warning log below, never the caller.
@Service
@RequiredArgsConstructor
public class LoggingServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(LoggingServiceClient.class);
    private static final String LOGGING_SERVICE_URL = "http://localhost:5085/api/logs";
    private static final String SOURCE = "core-service";

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
