package com.adelevate.clients;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.adelevate.dtos.payment.PaymentRequestDto;
import com.adelevate.dtos.payment.PaymentResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentClient {

    private final WebClient.Builder webClientBuilder;

    public PaymentResponseDto initiatePayment(PaymentRequestDto dto) {
        return webClientBuilder.build()
                .post()
                .uri("http://localhost:8081/api/payments") // ✅ Payment microservice ka URL
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(PaymentResponseDto.class)
                .block();
    }

    public PaymentResponseDto getPaymentByAd(Long adId) {
        return webClientBuilder.build()
                .get()
                .uri("http://localhost:9191/api/payments/ad/" + adId)
                .retrieve()
                .bodyToMono(PaymentResponseDto.class)
                .block();
    }
}
