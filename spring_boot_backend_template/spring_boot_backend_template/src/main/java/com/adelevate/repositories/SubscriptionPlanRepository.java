package com.adelevate.repositories;

import com.adelevate.entities.SubscriptionPlan;
import com.adelevate.enums.SubscriptionPlanType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    // Find plan by enum name (PLATINUM, GOLD, SILVER)
    Optional<SubscriptionPlan> findByPlanName(SubscriptionPlanType planName);

    // Find plan by priority level (Platinum > Gold > Silver)
    Optional<SubscriptionPlan> findByPriorityLevel(Integer priorityLevel);

    // ✅ New: Get all active plans sorted by priority (for dashboard)
    List<SubscriptionPlan> findAllByIsActiveTrueOrderByPriorityLevelDesc();
}
