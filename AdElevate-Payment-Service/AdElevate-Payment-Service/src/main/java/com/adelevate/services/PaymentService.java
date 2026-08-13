package com.adelevate.services;

import com.adelevate.dtos.AdSyncDto;
import com.adelevate.dtos.PaymentRequestDto;
import com.adelevate.dtos.PaymentResponseDto;
import com.adelevate.dtos.PlanRevenueDto;
import com.adelevate.enums.PaymentStatus;

import java.util.List;

public interface PaymentService {
    PaymentResponseDto initiatePayment(PaymentRequestDto dto);
    PaymentResponseDto getPaymentByAd(Long adId);
    List<PaymentResponseDto> getPaymentsByVendor(Long vendorId);
    boolean verifySignature(String orderId, String paymentId, String signature);
    void updatePaymentStatus(String orderId, PaymentStatus status);
    public void syncAdData(AdSyncDto dto);

    // ✅ For the admin "revenue by plan" pie chart
    List<PlanRevenueDto> getRevenueByPlan();
}
