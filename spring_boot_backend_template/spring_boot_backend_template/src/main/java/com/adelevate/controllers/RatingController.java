package com.adelevate.controllers;

import com.adelevate.dtos.rating.RatingRequestDto;
import com.adelevate.dtos.rating.RatingResponseDto;
import com.adelevate.services.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ads/{adId}/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public ResponseEntity<RatingResponseDto> createRating(@PathVariable Long adId,
                                                            @RequestBody @Valid RatingRequestDto dto) {
        return ResponseEntity.ok(ratingService.createRating(adId, dto));
    }

    @GetMapping
    public ResponseEntity<List<RatingResponseDto>> getRatings(@PathVariable Long adId) {
        return ResponseEntity.ok(ratingService.getRatingsByAd(adId));
    }
}
