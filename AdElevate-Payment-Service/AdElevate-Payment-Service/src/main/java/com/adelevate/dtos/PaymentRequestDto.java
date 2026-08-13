package com.adelevate.dtos;

//package com.adelevate.dtos.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PaymentRequestDto {

    // amount and vendorId are intentionally NOT here anymore. They're derived
    // server-side from the Payment row that syncAdData() already created when
    // the ad was posted, using the ad's selected subscription plan price.
    // A client should never be able to state its own price for a payment.
    @NotNull(message = "Ad ID is required")
    private Long adId;
}
