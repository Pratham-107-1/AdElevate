package com.adelevate.services;

import com.adelevate.dtos.ads.AdRequestDto;

import com.adelevate.dtos.ads.AdResponseDto;
import com.adelevate.dtos.ads.AdStatsDto;
import com.adelevate.dtos.ads.PlanAdCountDto;
import com.adelevate.enums.AdCategory;
import com.adelevate.enums.AdStatus;

import java.util.List;

public interface AdService {
    AdResponseDto createAd(AdRequestDto dto);
    AdResponseDto getAdById(Long id);
    List<AdResponseDto> getAllAds();
    AdResponseDto updateAd(Long id, AdRequestDto dto);
    void deleteAd(Long id);

    // ✅ New methods for Phase 3
    AdResponseDto approveAd(Long id);   // Admin approves
    AdResponseDto rejectAd(Long id);    // Admin rejects
    List<AdResponseDto> getApprovedAds(); // Customers view only approved ads
    List<AdResponseDto> getActiveAds();   // Ads that are approved + not expired
    List<AdResponseDto> getAdsByStatus(AdStatus status); // Generic status filter for dashboard
    void updateAdStatusAfterPayment(Long adId, AdStatus status);

    // ✅ Homepage / search page support
    List<AdResponseDto> searchAds(AdStatus status, AdCategory category, String city, String keyword);
    AdStatsDto getStats();
    List<PlanAdCountDto> getAdCountsByPlan();

}
