package com.adelevate.dtos.ads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class PlanAdCountDto {
    private String planName;
    private long adCount;
}
