package com.adelevate.dtos.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PaymentRequestDto {

    @NotNull(message = "Ad ID is required")
    private Long adId;

    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    @NotNull(message = "Plan ID is required")
    private Long planId;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be greater than 0")
    private Double amount;
}
