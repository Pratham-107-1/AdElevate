package com.adelevate.securityConfig;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class AppConfig {

    // Used for the synchronous Ad → Payment sync call, where we need the
    // result (or a thrown exception) before createAd() can return.
    @Bean
    RestClient restClient() {
        return RestClient.create();
    }

    // Used for fire-and-forget calls to the Logging microservice, so a slow
    // or unreachable logging service never blocks the calling request thread.
    @Bean
    WebClient webClient() {
        return WebClient.create();
    }
}
