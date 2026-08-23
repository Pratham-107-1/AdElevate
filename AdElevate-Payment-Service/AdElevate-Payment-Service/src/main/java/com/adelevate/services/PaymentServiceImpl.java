package com.adelevate.services;

import com.adelevate.clients.AdServiceClient;
import com.adelevate.clients.LoggingServiceClient;
import com.adelevate.dtos.AdSyncDto;
import com.adelevate.dtos.PaymentRequestDto;
import com.adelevate.dtos.PaymentResponseDto;
import com.adelevate.dtos.PlanRevenueDto;
import com.adelevate.entities.Payment;
import com.adelevate.enums.PaymentStatus;
import com.adelevate.repositories.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final String razorpaySecret; // injected from config
    private final AdServiceClient adServiceClient; // ✅ inject AdServiceClient
    private final LoggingServiceClient loggingServiceClient;

    @Override
    public PaymentResponseDto initiatePayment(PaymentRequestDto dto) {
        // The Payment row for this ad was already created by syncAdData() when
        // the ad was posted, with the correct amount (the ad's subscription
        // plan price) and vendorId already set. We look it up and use THOSE
        // values — never anything the client sends — so a vendor can never
        // pay a different amount than what their chosen plan actually costs.
        Payment payment = paymentRepository.findByAdId(dto.getAdId())
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "No synced payment record found for adId " + dto.getAdId() +
                        " — the ad may not exist, or wasn't synced from the Core service correctly."));

        if (payment.getAmount() == null || payment.getAmount() <= 0) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException(
                    "Ad " + dto.getAdId() + " has no valid subscription plan amount — cannot initiate payment.");
        }

        payment.setStatus(PaymentStatus.PENDING_PAYMENT);

        try {
            JSONObject orderRequest = new JSONObject();
            // ✅ FIX: Razorpay's Orders API requires "amount" to be a plain integer
            // number of paise. payment.getAmount() is a Double, so
            // "payment.getAmount() * 100" was putting a decimal (e.g. 499900.0)
            // into the request, which Razorpay rejected with a RazorpayException
            // on every single order — Math.round(...) makes it a long/int.
            orderRequest.put("amount", Math.round(payment.getAmount() * 100));
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + dto.getAdId());

            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);

            if (order != null) {
                String razorpayOrderId = order.get("id");
                payment.setOrderId(razorpayOrderId);
                payment.setStatus(PaymentStatus.PENDING_PAYMENT);

                System.out.println("✅ Razorpay Order Created: " + razorpayOrderId);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                System.out.println("❌ Razorpay Order creation returned null");
                // ✅ FIX: don't return a 200 with a broken/null order — the
                // frontend would open Razorpay Checkout with a bad order_id
                // and fail deep inside the checkout iframe instead of showing
                // a clean error on our own payment page.
                throw new RuntimeException("Could not create Razorpay order for ad " + dto.getAdId() + ".");
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
            payment.setStatus(PaymentStatus.FAILED);
            payment.setOrderId("ERROR_" + dto.getAdId()); // marker for debugging
            paymentRepository.save(payment);
            System.out.println("❌ Razorpay Exception: " + e.getMessage());
            // ✅ FIX: propagate so GlobalExceptionHandler turns this into a
            // clean 400 { "error": ... } that PaymentPage.jsx already knows
            // how to display, instead of silently returning 200 OK with a
            // fake "ERROR_<adId>" order_id that Razorpay Checkout would then
            // fail on with the generic "Oops! Something went wrong" screen.
            throw new RuntimeException("Could not initiate payment: " + e.getMessage());
        }

        paymentRepository.save(payment);
        return toDto(payment);
    }

    @Override
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpaySecret);

            if (isValid) {
                // ✅ Update payment status
                updatePaymentStatus(orderId, PaymentStatus.SUCCESS);

                // ✅ Fetch payment record
                Payment payment = paymentRepository.findByOrderId(orderId)
                        .orElseThrow(() -> new RuntimeException("Payment not found"));

                // ✅ Update Ad status if adId exists
                if (payment.getAdId() != null) {
                    System.out.println("Updating Ad ID " + payment.getAdId() + " to PENDING_APPROVAL");
                    adServiceClient.updateAdStatus(payment.getAdId(), "PENDING_APPROVAL");
                } else {
                    System.out.println("⚠️ Ad ID is null, cannot update Ad status");
                }
            }

            return isValid;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void updatePaymentStatus(String orderId, PaymentStatus status) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Guard against double-logging: this method actually gets called
        // twice for one successful payment (once inside verifySignature(),
        // then again from the controller's /verify handler). Only log the
        // SUCCESS → SUCCESS no-op transition once, on the first call.
        PaymentStatus previousStatus = payment.getStatus();

        payment.setStatus(status);
        paymentRepository.save(payment);

        if (status == PaymentStatus.SUCCESS && previousStatus != PaymentStatus.SUCCESS) {
            loggingServiceClient.logEvent(
                    "PAYMENT_SUCCESS",
                    "Payment of ₹" + payment.getAmount() + " succeeded for ad " + payment.getAdId()
                            + " (orderId " + orderId + ")",
                    payment.getVendorId(),
                    null);
        }
    }

    private PaymentResponseDto toDto(Payment payment) {
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setPaymentId(payment.getPaymentId());
        dto.setAdId(payment.getAdId());
        dto.setOrderId(payment.getOrderId());
        dto.setVendorId(payment.getVendorId());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus().name());
        dto.setCreatedAt(payment.getCreatedAt().toString());
        return dto;
    }

    @Override
    public PaymentResponseDto getPaymentByAd(Long adId) {
        Payment payment = paymentRepository.findByAdId(adId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment not found for Ad ID: " + adId));
        return toDto(payment);
    }

    @Override
    public List<PaymentResponseDto> getPaymentsByVendor(Long vendorId) {
        return paymentRepository.findByVendorId(vendorId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void syncAdData(AdSyncDto dto) {
        // ✅ Same fix mirrored here: update the existing row for this ad
        // if one already exists, instead of always inserting a new one.
        Payment payment = paymentRepository.findByAdId(dto.getAdId())
                .stream()
                .findFirst()
                .orElseGet(Payment::new);

        payment.setAdId(dto.getAdId());
        payment.setVendorId(dto.getVendorId());
        payment.setPlanId(dto.getPlanId());
        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus());
        paymentRepository.save(payment);
    }

    @Override
    public List<PlanRevenueDto> getRevenueByPlan() {
        return paymentRepository.sumRevenueByPlan(PaymentStatus.SUCCESS)
                .stream()
                .map(row -> new PlanRevenueDto((Long) row[0], (Double) row[1], (Long) row[2]))
                .collect(Collectors.toList());
    }
}