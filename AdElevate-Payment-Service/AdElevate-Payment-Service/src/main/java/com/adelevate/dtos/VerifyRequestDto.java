package com.adelevate.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyRequestDto {
    private String orderId;
    private String paymentId;
    private String signature;
    private Long adId;
}

