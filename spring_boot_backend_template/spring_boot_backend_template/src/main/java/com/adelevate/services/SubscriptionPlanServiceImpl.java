package com.adelevate.services;

import com.adelevate.dtos.subscriptionPlan.SubscriptionPlanDto;
import com.adelevate.entities.SubscriptionPlan;
import com.adelevate.enums.SubscriptionPlanType;
import com.adelevate.repositories.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;

    @Override
    public List<SubscriptionPlanDto> getAllPlans() {
        return planRepository.findAllByIsActiveTrueOrderByPriorityLevelDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public SubscriptionPlanDto getPlanById(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        return toDto(plan);
    }

    @Override
    public SubscriptionPlanDto createPlan(SubscriptionPlanDto dto) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setPlanName(SubscriptionPlanType.valueOf(dto.getPlanName()));
        plan.setDuration(dto.getDuration());
        plan.setPrice(dto.getPrice());
        plan.setPriorityLevel(dto.getPriorityLevel());
        plan.setDescription(dto.getDescription());
        plan.setMaxAdsAllowed(dto.getMaxAdsAllowed());
        plan.setIsActive(true);

        planRepository.save(plan);
        return toDto(plan);
    }

    @Override
    public SubscriptionPlanDto updatePlan(Long id, SubscriptionPlanDto dto) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setDuration(dto.getDuration());
        plan.setPrice(dto.getPrice());
        plan.setPriorityLevel(dto.getPriorityLevel());
        plan.setDescription(dto.getDescription());
        plan.setMaxAdsAllowed(dto.getMaxAdsAllowed());
        plan.setIsActive(dto.getIsActive());

        planRepository.save(plan);
        return toDto(plan);
    }

    @Override
    public void deactivatePlan(Long id) {
        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setIsActive(false);
        planRepository.save(plan);
    }

    private SubscriptionPlanDto toDto(SubscriptionPlan plan) {
        SubscriptionPlanDto dto = new SubscriptionPlanDto();
        dto.setPlanId(plan.getPlanId());
        dto.setPlanName(plan.getPlanName().name());
        dto.setDuration(plan.getDuration());
        dto.setPrice(plan.getPrice());
        dto.setPriorityLevel(plan.getPriorityLevel());
        dto.setDescription(plan.getDescription());
        dto.setMaxAdsAllowed(plan.getMaxAdsAllowed());
        dto.setIsActive(plan.getIsActive());
        return dto;
    }
}
