package com.adelevate.dtos.rating;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RatingResponseDto {
    private Long ratingId;
    private Long adId;
    private Long customerId;
    private String customerName;
    private Integer ratingValue;
    private String reviewText;
    private String createdAt;
}
