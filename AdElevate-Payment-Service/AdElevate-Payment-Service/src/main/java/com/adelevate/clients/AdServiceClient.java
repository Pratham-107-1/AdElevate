package com.adelevate.clients;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdServiceClient {

    private final RestClient restClient;

    public void updateAdStatus(Long adId, String status) {
        String url = "http://localhost:9090/api/ads/" + adId + "/status?status=" + status;
        restClient.put()
                .uri(url)
                .retrieve()
                .toBodilessEntity();
    }
}

