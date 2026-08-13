package com.adelevate.dtos;

import com.adelevate.enums.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdSyncDto {
    private Long adId;
    private Long vendorId;
    private Long planId;
    private Double amount;
    private PaymentStatus status;

}
