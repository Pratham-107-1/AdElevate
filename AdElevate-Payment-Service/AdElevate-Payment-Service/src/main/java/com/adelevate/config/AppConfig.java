package com.adelevate.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AppConfig {

    // Used for the synchronous call to Core to update an ad's status after
    // payment — the caller needs to know if it succeeded.
    @Bean
    RestClient restClient() {
        return RestClient.create();
    }

    // Used for fire-and-forget calls to the Logging microservice, so a slow
    // or unreachable logging service never blocks a payment request.
    @Bean
    WebClient webClient() {
        return WebClient.create();
    }
}

