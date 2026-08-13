package com.adelevate.services;

import com.adelevate.enums.PaymentStatus;

public interface AdService {
    void updateAdStatusAfterPayment(Long adId, PaymentStatus status);
}
