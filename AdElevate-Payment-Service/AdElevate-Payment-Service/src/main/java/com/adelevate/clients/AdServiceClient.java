package com.adelevate.clients;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdServiceClient {

    private final RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${core.service.url}")
    private String coreServiceUrl;

    public void updateAdStatus(Long adId, String status) {
        String url = coreServiceUrl + "/api/ads/" + adId + "/status?status=" + status;
        restTemplate.put(url, null);
    }
}

