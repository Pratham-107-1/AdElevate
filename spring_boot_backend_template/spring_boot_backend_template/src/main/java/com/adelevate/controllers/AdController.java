package com.adelevate.controllers;

import com.adelevate.dtos.ads.AdRequestDto;
import com.adelevate.dtos.ads.AdResponseDto;
import com.adelevate.dtos.ads.AdStatsDto;
import com.adelevate.dtos.ads.PlanAdCountDto;
import com.adelevate.enums.AdCategory;
import com.adelevate.enums.AdStatus;
import com.adelevate.services.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;

    // ✅ Create new Ad
    @PostMapping
    public ResponseEntity<AdResponseDto> createAd(@RequestBody AdRequestDto dto) {
        return ResponseEntity.ok(adService.createAd(dto));
    }

    // ✅ Get Ad by ID
    @GetMapping("/{id}")
    public ResponseEntity<AdResponseDto> getAdById(@PathVariable Long id) {
        return ResponseEntity.ok(adService.getAdById(id));
    }

    // ✅ Get all Ads, with any combination of optional filters:
    // status (e.g. APPROVED), category, city, and a free-text keyword
    // matched against the title. Powers the homepage, category pills,
    // and search bar in one endpoint.
    @GetMapping
    public ResponseEntity<List<AdResponseDto>> getAllAds(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword) {

        AdStatus statusEnum = null;
        AdCategory categoryEnum = null;
        try {
            if (status != null && !status.isBlank()) statusEnum = AdStatus.valueOf(status);
            if (category != null && !category.isBlank()) categoryEnum = AdCategory.valueOf(category);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        boolean noFilters = statusEnum == null && categoryEnum == null
                && (city == null || city.isBlank()) && (keyword == null || keyword.isBlank());
        if (noFilters) {
            return ResponseEntity.ok(adService.getAllAds());
        }

        String cityFilter = (city != null && !city.isBlank()) ? city : null;
        String keywordFilter = (keyword != null && !keyword.isBlank()) ? keyword : null;
        return ResponseEntity.ok(adService.searchAds(statusEnum, categoryEnum, cityFilter, keywordFilter));
    }

    // ✅ Homepage stats bar — real counts, computed from the database
    @GetMapping("/stats")
    public ResponseEntity<AdStatsDto> getStats() {
        return ResponseEntity.ok(adService.getStats());
    }

    // ✅ For the admin "ads by plan" pie chart
    @GetMapping("/stats/by-plan")
    public ResponseEntity<List<PlanAdCountDto>> getAdCountsByPlan() {
        return ResponseEntity.ok(adService.getAdCountsByPlan());
    }

    // ✅ Update Ad
    @PutMapping("/{id}")
    public ResponseEntity<AdResponseDto> updateAd(@PathVariable Long id, @RequestBody AdRequestDto dto) {
        return ResponseEntity.ok(adService.updateAd(id, dto));
    }

    // ✅ Delete Ad
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAd(@PathVariable Long id) {
        try {
            adService.deleteAd(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // Previously any failure here (e.g. an ad with ratings still
            // attached) surfaced as an uncaught 500 with no body, which the
            // frontend swallowed silently — the vendor just saw the ad still
            // sitting in the list with no explanation. Return a real error
            // message instead so the UI can show it.
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // ✅ Approve Ad
    @PutMapping("/{id}/approve")
    public ResponseEntity<AdResponseDto> approveAd(@PathVariable Long id) {
        return ResponseEntity.ok(adService.approveAd(id));
    }

    // ✅ Reject Ad
    @PutMapping("/{id}/reject")
    public ResponseEntity<AdResponseDto> rejectAd(@PathVariable Long id) {
        return ResponseEntity.ok(adService.rejectAd(id));
    }

    // ✅ Get Approved Ads
    @GetMapping("/approved")
    public ResponseEntity<List<AdResponseDto>> getApprovedAds() {
        return ResponseEntity.ok(adService.getApprovedAds());
    }

    // ✅ Get Active Ads
    @GetMapping("/active")
    public ResponseEntity<List<AdResponseDto>> getActiveAds() {
        return ResponseEntity.ok(adService.getActiveAds());
    }

    // ✅ Update Ad Status (used by Payment microservice only — never for
    // approval decisions, which must go through the admin-guarded
    // /{id}/approve and /{id}/reject endpoints instead)
    private static final java.util.Set<AdStatus> PAYMENT_LIFECYCLE_STATUSES = java.util.Set.of(
            AdStatus.PENDING_PAYMENT,
            AdStatus.PENDING_APPROVAL,
            AdStatus.PAYMENT_FAILED
    );

    @PutMapping("/{adId}/status")
    public ResponseEntity<String> updateAdStatus(@PathVariable Long adId,
                                                 @RequestParam String status) {
        try {
            AdStatus adStatus = AdStatus.valueOf(status);

            if (!PAYMENT_LIFECYCLE_STATUSES.contains(adStatus)) {
                return ResponseEntity.status(403).body(
                        "Status '" + status + "' cannot be set via this endpoint. " +
                        "Use /api/ads/" + adId + "/approve or /reject instead.");
            }

            adService.updateAdStatusAfterPayment(adId, adStatus);
            return ResponseEntity.ok("Ad status updated to " + status);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + status);
        }
    }
}
