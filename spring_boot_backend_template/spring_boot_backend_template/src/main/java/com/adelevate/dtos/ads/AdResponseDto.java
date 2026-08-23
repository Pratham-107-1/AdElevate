package com.adelevate.dtos.ads;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdResponseDto {
    private Long adId;                // needed so the frontend can chain straight into payment
    private Long vendorId;
    private String vendorName;        // ✅ for direct customer contact
    private String vendorEmail;       // ✅ for direct customer contact
    private String vendorPhone;       // ✅ for direct customer contact
    private String vendorBusinessName;
    private String title;             // TrendZone Fashion Hub
    private String category;          // Clothing & Fashion
    private String city;              // Bangalore, KA
    private String description;       // ✅ was missing entirely — vendor's description
                                       // was saved fine in the DB but never sent back
                                       // to the frontend, so it could never display.
    private String productImage;      // Image URL or path
    private String planType;          // Platinum / Gold / Silver
    private Double averageRating;     // 4.8
    private Integer totalReviews;     // 128
    private String priceRange;        // ₹999–₹4,999 or ₹299/visit
    private Double minPrice;          // ✅ raw values, so the edit form doesn't
    private Double maxPrice;          //    have to parse them back out of priceRange
    private String status; // from AdStatus enum

}
