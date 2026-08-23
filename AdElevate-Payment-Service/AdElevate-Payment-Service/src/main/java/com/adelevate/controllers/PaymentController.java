package com.adelevate.controllers;

import com.adelevate.clients.AdServiceClient;
import com.adelevate.dtos.AdSyncDto;
import com.adelevate.dtos.PaymentRequestDto;
import com.adelevate.dtos.PaymentResponseDto;
import com.adelevate.dtos.PlanRevenueDto;
import com.adelevate.dtos.VerifyRequestDto;
import com.adelevate.enums.PaymentStatus;
//import com.adelevate.services.AdService;
import com.adelevate.services.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final PaymentService paymentService;
//    private final AdService adService; // ✅ inject AdService here
    private final AdServiceClient adServiceClient;
    private final String razorpayKey; // ✅ key_id only, from RazorpayConfig — never the secret

    // ✅ Single source of truth for the Razorpay key_id. The frontend fetches
    // this instead of hardcoding its own copy, so it's physically impossible
    // for the frontend and backend keys to drift out of sync again.
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getPaymentConfig() {
        return ResponseEntity.ok(Map.of("key", razorpayKey));
    }

//    @PostMapping("/order")
    @PostMapping
    public ResponseEntity<PaymentResponseDto> initiatePayment(@Valid @RequestBody PaymentRequestDto dto) {
        return ResponseEntity.ok(paymentService.initiatePayment(dto));
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(paymentService.getPaymentsByVendor(vendorId));
    }

    // ✅ For the admin "revenue by plan" pie chart
    @GetMapping("/stats/by-plan")
    public ResponseEntity<List<PlanRevenueDto>> getRevenueByPlan() {
        return ResponseEntity.ok(paymentService.getRevenueByPlan());
    }

    @GetMapping("/ad/{adId}")
    public ResponseEntity<PaymentResponseDto> getPaymentByAd(@PathVariable Long adId) {
        return ResponseEntity.ok(paymentService.getPaymentByAd(adId));
    }

//    @PostMapping("/verify")
//    public ResponseEntity<String> verifyPayment(@RequestBody VerifyRequestDto dto) {
//        boolean isValid = paymentService.verifySignature(dto.getOrderId(), dto.getPaymentId(), dto.getSignature());
//
//        if (isValid) {
//            // ✅ Step 1: Update payment status
//            paymentService.updatePaymentStatus(dto.getOrderId(), PaymentStatus.SUCCESS);
//
//            // ✅ Step 2: Update Ad status in Core microservice
//            adServiceClient.updateAdStatus(dto.getAdId(), "PENDING_APPROVAL");
//
//            return ResponseEntity.ok("Payment verified successfully, Ad moved to PENDING_APPROVAL");
//        } else {
//            // ❌ Step 3: Handle failed payment
//            paymentService.updatePaymentStatus(dto.getOrderId(), PaymentStatus.FAILED);
//            adServiceClient.updateAdStatus(dto.getAdId(), "PAYMENT_FAILED");
//
//            return ResponseEntity.status(400).body("Invalid signature, Payment failed");
//        }
//    }
    
    
    //-----------------------------------------Ye Dummy Testing ke liye hai  niche vale /verify
    //ko comment out kar de na after dummy testing done aur uper vala uncomment kar dena
    
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody VerifyRequestDto dto) {
        boolean isValid = paymentService.verifySignature(dto.getOrderId(), dto.getPaymentId(), dto.getSignature());

        if (isValid) {
            // ✅ Step 1: Update payment status
            paymentService.updatePaymentStatus(dto.getOrderId(), PaymentStatus.SUCCESS);

            // ✅ Step 2: Update Ad status in Core microservice
            adServiceClient.updateAdStatus(dto.getAdId(), "PENDING_APPROVAL");

            return ResponseEntity.ok("Payment verified successfully, Ad moved to PENDING_APPROVAL");
        } else {
            // ❌ Step 3: Handle failed payment (REAL gateway case)
            // paymentService.updatePaymentStatus(dto.getOrderId(), PaymentStatus.FAILED);
            // adServiceClient.updateAdStatus(dto.getAdId(), "PAYMENT_FAILED");
            // return ResponseEntity.status(400).body("Invalid signature, Payment failed");

            // ⚠️ TESTING MODE: Bypass signature validation
            // 👉 Jab real gateway integrate karoge, upar ke FAILED block uncomment karna
//            log.warn("Invalid signature, but skipping for test");
            paymentService.updatePaymentStatus(dto.getOrderId(), PaymentStatus.SUCCESS);
            adServiceClient.updateAdStatus(dto.getAdId(), "PENDING_APPROVAL");

            return ResponseEntity.ok("Payment forced to SUCCESS for testing");
        }
    }



        @PostMapping("/syncAd")
        public ResponseEntity<String> syncAd(@RequestBody AdSyncDto adSyncDto) {
            paymentService.syncAdData(adSyncDto);
            return ResponseEntity.ok("Ad synced successfully in payment DB");
         
    }



    
    

}
