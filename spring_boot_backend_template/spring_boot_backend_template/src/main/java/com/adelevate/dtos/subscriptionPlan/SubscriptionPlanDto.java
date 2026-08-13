package com.adelevate.dtos.subscriptionPlan;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SubscriptionPlanDto {
    private Long planId;
    private String planName;       // PLATINUM, GOLD, SILVER
    private Integer duration;      // in days
    private Double price;
    private Integer priorityLevel; // Platinum > Gold > Silver
    private String description;    // Plan features
    private Integer maxAdsAllowed; // Ads limit per plan
    private Boolean isActive;      // Active/Inactive
}
