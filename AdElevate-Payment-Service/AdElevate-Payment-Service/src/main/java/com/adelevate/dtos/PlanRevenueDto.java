package com.adelevate.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class PlanRevenueDto {
    private Long planId;      // frontend cross-references this against
                               // /api/subscription-plans (Core service) to
                               // get the plan name - Payment Service only
                               // knows the ID, not the name
    private Double totalRevenue;
    private long paymentCount;
}
