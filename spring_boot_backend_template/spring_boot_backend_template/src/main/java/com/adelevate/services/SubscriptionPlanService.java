package com.adelevate.services;

import com.adelevate.dtos.subscriptionPlan.SubscriptionPlanDto;
import java.util.List;

public interface SubscriptionPlanService {
    List<SubscriptionPlanDto> getAllPlans();
    SubscriptionPlanDto getPlanById(Long id);
    SubscriptionPlanDto createPlan(SubscriptionPlanDto dto);
    SubscriptionPlanDto updatePlan(Long id, SubscriptionPlanDto dto);
    void deactivatePlan(Long id);
}
