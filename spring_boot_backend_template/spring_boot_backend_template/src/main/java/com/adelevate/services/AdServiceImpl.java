package com.adelevate.services;

import com.adelevate.dtos.ads.AdRequestDto;
import com.adelevate.dtos.ads.AdResponseDto;
import com.adelevate.dtos.ads.AdStatsDto;
import com.adelevate.dtos.ads.PlanAdCountDto;
import com.adelevate.dtos.ads.AdSyncDto;
import com.adelevate.entities.*;
import com.adelevate.enums.AdCategory;
import com.adelevate.enums.AdStatus;
import com.adelevate.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdServiceImpl implements AdService {

    private final AdRepository adRepository;
    private final BusinessVendorRepository vendorRepository;
    private final SubscriptionPlanRepository planRepository;
    private final LocationRepository locationRepository;
    private final RatingRepository ratingRepository;
    private final RestClient restClient; // ✅ For cross-service sync (needs the call to block + throw on failure)

    @Override
    public AdResponseDto createAd(AdRequestDto dto) {
        BusinessVendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        SubscriptionPlan plan = planRepository.findById(dto.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        // Vendors supply a plain city name (e.g. "Mumbai"), not a locationId —
        // find the matching Location, or create one on the fly if it's new.
        if (dto.getCity() == null || dto.getCity().isBlank()) {
            throw new RuntimeException("City is required");
        }
        Location location = locationRepository.findByCityIgnoreCase(dto.getCity().trim())
                .orElseGet(() -> {
                    Location newLocation = new Location();
                    newLocation.setCity(dto.getCity().trim());
                    return locationRepository.save(newLocation);
                });

        // ✅ Create Ad entity
        Ad ad = new Ad();
        ad.setTitle(dto.getTitle());
        ad.setDescription(dto.getDescription());
        ad.setProductImage(dto.getProductImage());
        ad.setCategory(AdCategory.valueOf(dto.getCategory()));
        ad.setStatus(AdStatus.PENDING_PAYMENT); // Default status
        ad.setExpirationDate(dto.getExpirationDate());
        ad.setMinPrice(dto.getMinPrice());
        ad.setMaxPrice(dto.getMaxPrice());
        ad.setVendor(vendor);
        ad.setSubscriptionPlan(plan);
        ad.setLocation(location);

        adRepository.save(ad);

        // ✅ Sync Ad data to Payment microservice.
        // amount = the SELECTED PLAN's price (what the vendor pays Adelevate to
        // list the ad), NOT the product's own min/max price — those are unrelated
        // numbers that happened to share a field before this fix.
        AdSyncDto syncDto = new AdSyncDto();
        syncDto.setAdId(ad.getAdId());
        syncDto.setVendorId(dto.getVendorId());
        syncDto.setPlanId(dto.getPlanId());
        syncDto.setAmount(plan.getPrice());
        syncDto.setStatus(ad.getStatus().name());

        try {
            restClient.post()
                    .uri("http://localhost:8081/api/payments/syncAd")
                    .body(syncDto)
                    .retrieve()
                    .toEntity(String.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to sync Ad with Payment microservice: " + e.getMessage());
        }

        return toDto(ad);
    }

    @Override
    public AdResponseDto getAdById(Long id) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        return toDto(ad);
    }

    @Override
    public List<AdResponseDto> getAllAds() {
        return adRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AdResponseDto updateAd(Long id, AdRequestDto dto) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));

        ad.setTitle(dto.getTitle());
        ad.setDescription(dto.getDescription());
        ad.setProductImage(dto.getProductImage());
        ad.setCategory(AdCategory.valueOf(dto.getCategory()));
        ad.setMinPrice(dto.getMinPrice());
        ad.setMaxPrice(dto.getMaxPrice());

        // ✅ FIX: expirationDate is never sent back to the frontend in
        // AdResponseDto, so an edit form has no way to round-trip it. Only
        // overwrite it if the caller actually provided one — otherwise a
        // routine "edit title/description" save would silently null out
        // the ad's expiration date.
        if (dto.getExpirationDate() != null) {
            ad.setExpirationDate(dto.getExpirationDate());
        }

        // ✅ FIX: city was accepted in AdRequestDto but silently ignored here
        // (unlike createAd, which resolves it to a Location). An edit form
        // that let a vendor change the city would have looked like it saved
        // but done nothing. Same find-or-create pattern as createAd().
        if (dto.getCity() != null && !dto.getCity().isBlank()) {
            Location location = locationRepository.findByCityIgnoreCase(dto.getCity().trim())
                    .orElseGet(() -> {
                        Location newLocation = new Location();
                        newLocation.setCity(dto.getCity().trim());
                        return locationRepository.save(newLocation);
                    });
            ad.setLocation(location);
        }

        adRepository.save(ad);
        return toDto(ad);
    }

    @Override
    public void deleteAd(Long id) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));

        // Ratings hold a NOT NULL foreign key to this ad, so deleting the ad
        // first (without clearing its ratings) throws a DataIntegrityViolationException
        // that was previously left uncaught by the controller — the delete request
        // failed silently from the vendor's point of view (list just never refreshed).
        // Ads with no ratings yet happened to delete fine, which is why this only
        // showed up on some ads and not others. Clear the ratings first so the
        // ad itself can always be removed.
        List<Rating> ratings = ratingRepository.findByAdAdIdOrderByCreatedAtDesc(id);
        if (!ratings.isEmpty()) {
            ratingRepository.deleteAll(ratings);
        }

        adRepository.delete(ad);
    }

    @Override
    public AdResponseDto approveAd(Long id) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        ad.setStatus(AdStatus.APPROVED);
        adRepository.save(ad);
        return toDto(ad);
    }

    @Override
    public AdResponseDto rejectAd(Long id) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        ad.setStatus(AdStatus.REJECTED);
        adRepository.save(ad);
        return toDto(ad);
    }

    @Override
    public List<AdResponseDto> getApprovedAds() {
        return adRepository.findByStatus(AdStatus.APPROVED)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdResponseDto> getActiveAds() {
        return adRepository.findByStatus(AdStatus.ACTIVE)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdResponseDto> getAdsByStatus(AdStatus status) {
        return adRepository.findByStatus(status)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ✅ Convert Entity → DTO
    private AdResponseDto toDto(Ad ad) {
        AdResponseDto dto = new AdResponseDto();
        dto.setAdId(ad.getAdId());
        dto.setVendorId(ad.getVendor().getVendorId());
        dto.setVendorName(ad.getVendor().getUser().getName());
        dto.setVendorEmail(ad.getVendor().getUser().getEmail());
        dto.setVendorPhone(ad.getVendor().getUser().getPhoneNumber());
        dto.setVendorBusinessName(ad.getVendor().getBusinessName());
        dto.setTitle(ad.getTitle());
        dto.setCategory(ad.getCategory().name());
        dto.setCity(ad.getLocation().getCity());
        dto.setDescription(ad.getDescription());
        dto.setProductImage(ad.getProductImage());
        dto.setPlanType(ad.getSubscriptionPlan().getPlanName().name());
        dto.setAverageRating(adRepository.findAverageRatingByAdId(ad.getAdId()));
        dto.setTotalReviews(adRepository.countRatingsByAdId(ad.getAdId()));
        dto.setPriceRange("₹" + ad.getMinPrice() + "–₹" + ad.getMaxPrice());
        dto.setMinPrice(ad.getMinPrice());
        dto.setMaxPrice(ad.getMaxPrice());
        dto.setStatus(ad.getStatus().name());
        return dto;
    }

    @Override
    public void updateAdStatusAfterPayment(Long adId, AdStatus status) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        ad.setStatus(status);
        adRepository.save(ad);
    }

    @Override
    public List<AdResponseDto> searchAds(AdStatus status, AdCategory category, String city, String keyword) {
        return adRepository.searchAds(status, category, city, keyword)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AdStatsDto getStats() {
        long activeAds = adRepository.countByStatus(AdStatus.APPROVED);
        long verifiedProviders = adRepository.countDistinctVendorsByStatus(AdStatus.APPROVED);
        int categories = AdCategory.values().length;
        Double avgRating = adRepository.findOverallAverageRating(); // null if no ratings exist yet
        return new AdStatsDto(activeAds, verifiedProviders, categories, avgRating);
    }

    @Override
    public List<PlanAdCountDto> getAdCountsByPlan() {
        return adRepository.countByPlanNameAndStatus(AdStatus.APPROVED)
                .stream()
                .map(row -> new PlanAdCountDto(row[0].toString(), (Long) row[1]))
                .collect(Collectors.toList());
    }
}
