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

    @org.springframework.beans.factory.annotation.Value("${payment.service.url}")
    private String paymentServiceUrl;

    public PaymentResponseDto initiatePayment(PaymentRequestDto dto) {
        return webClientBuilder.build()
                .post()
                .uri(paymentServiceUrl + "/api/payments")
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(PaymentResponseDto.class)
                .block();
    }

    public PaymentResponseDto getPaymentByAd(Long adId) {
        // NOTE: this previously pointed at port 9191, which nothing in this
        // project runs on — the Payment service is on 8081. Fixed as part of
        // parameterizing it; this method is currently unused (dead code) so
        // the bug never surfaced, but it's fixed now in case it gets wired up.
        return webClientBuilder.build()
                .get()
                .uri(paymentServiceUrl + "/api/payments/ad/" + adId)
                .retrieve()
                .bodyToMono(PaymentResponseDto.class)
                .block();
    }
}
