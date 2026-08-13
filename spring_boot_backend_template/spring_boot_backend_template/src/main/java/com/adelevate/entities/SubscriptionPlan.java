package com.adelevate.entities;

import com.adelevate.enums.SubscriptionPlanType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subscription_plan")
@Getter @Setter
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long planId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private SubscriptionPlanType planName;  // PLATINUM, GOLD, SILVER

    @Column(nullable = false)
    private Integer duration; // in days

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer priorityLevel; // Platinum > Gold > Silver

    // ✅ New field: plan description
    @Column(length = 500)
    private String description;

    // ✅ New field: max ads allowed for vendor
    @Column(nullable = false)
    private Integer maxAdsAllowed;

    // ✅ New field: plan active/deactivated
    @Column(nullable = false)
    private Boolean isActive = true;
}
