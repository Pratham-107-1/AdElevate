package com.adelevate.dtos.ads;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter @Setter
public class VendorAdResponseDto {        
    private String adTitle;         // TrendZone Fashion Hub
    private String category;        // Clothing & Fashion
    private String planType;        // Platinum / Gold / Silver
    private String status;          // Active / Expired / Pending
    private LocalDate expirationDate; // Ad expiry date
    private Double averageRating;   // Calculated dynamically from Rating table
}
