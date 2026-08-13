package com.adelevate.services;

import com.adelevate.dtos.rating.RatingRequestDto;
import com.adelevate.dtos.rating.RatingResponseDto;
import com.adelevate.entities.Ad;
import com.adelevate.entities.Customer;
import com.adelevate.entities.Rating;
import com.adelevate.repositories.AdRepository;
import com.adelevate.repositories.CustomerRepository;
import com.adelevate.repositories.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final AdRepository adRepository;
    private final CustomerRepository customerRepository;

    @Override
    public RatingResponseDto createRating(Long adId, RatingRequestDto dto) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Rating rating = new Rating();
        rating.setAd(ad);
        rating.setCustomer(customer);
        rating.setRatingValue(dto.getRatingValue());
        rating.setReviewText(dto.getReviewText());

        ratingRepository.save(rating);
        return toDto(rating);
    }

    @Override
    public List<RatingResponseDto> getRatingsByAd(Long adId) {
        return ratingRepository.findByAdAdIdOrderByCreatedAtDesc(adId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private RatingResponseDto toDto(Rating rating) {
        RatingResponseDto dto = new RatingResponseDto();
        dto.setRatingId(rating.getRatingId());
        dto.setAdId(rating.getAd().getAdId());
        dto.setCustomerId(rating.getCustomer().getCustomerId());
        dto.setCustomerName(rating.getCustomer().getUser().getName());
        dto.setRatingValue(rating.getRatingValue());
        dto.setReviewText(rating.getReviewText());
        dto.setCreatedAt(rating.getCreatedAt() != null ? rating.getCreatedAt().toString() : null);
        return dto;
    }
}
