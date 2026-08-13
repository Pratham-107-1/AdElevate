package com.adelevate.dtos.ads;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class AdStatsDto {
    private long activeAds;          // count of ads with status = APPROVED
    private long verifiedProviders;  // distinct vendors with at least one APPROVED ad
    private int categories;          // count of AdCategory enum values
    private Double avgRating;        // null if no ratings exist yet — frontend should handle that
}
