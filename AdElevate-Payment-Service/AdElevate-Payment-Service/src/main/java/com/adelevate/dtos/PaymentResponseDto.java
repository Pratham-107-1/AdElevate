package com.adelevate.dtos;



import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PaymentResponseDto {
    private Long paymentId;
    private Long adId;
    private String orderId;
    private Long vendorId;
    private String planName;   // SILVER, GOLD, PLATINUM
    private Double amount;
    private String status;     // SUCCESS, FAILED, PENDING
    private String createdAt;  // ISO date-time string
}
