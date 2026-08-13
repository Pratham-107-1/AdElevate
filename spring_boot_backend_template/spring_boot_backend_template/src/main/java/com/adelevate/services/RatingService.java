package com.adelevate.services;

import com.adelevate.dtos.rating.RatingRequestDto;
import com.adelevate.dtos.rating.RatingResponseDto;

import java.util.List;

public interface RatingService {
    RatingResponseDto createRating(Long adId, RatingRequestDto dto);
    List<RatingResponseDto> getRatingsByAd(Long adId);
}
