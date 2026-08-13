package com.adelevate.repositories;

import com.adelevate.entities.Ad;
import com.adelevate.enums.AdCategory;
import com.adelevate.enums.AdStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findByCategory(AdCategory category);
    List<Ad> findByVendorVendorId(Long vendorId);
    List<Ad> findByStatus(AdStatus status);   // ✅ New: filter ads by status
    List<Ad> findByLocationCity(String city); // ✅ New: filter ads by city

    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.ad.adId = :adId")
    Double findAverageRatingByAdId(@Param("adId") Long adId);

    @Query("SELECT COUNT(r.ratingId) FROM Rating r WHERE r.ad.adId = :adId")
    Integer countRatingsByAdId(@Param("adId") Long adId);

    // ✅ Flexible search for the homepage/search page — every filter is
    // optional. Powers "search by category", "search by location", and the
    // free-text search box (matched against title) in one query.
    @Query("SELECT a FROM Ad a WHERE " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:city IS NULL OR LOWER(a.location.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:keyword IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Ad> searchAds(@Param("status") AdStatus status,
                        @Param("category") AdCategory category,
                        @Param("city") String city,
                        @Param("keyword") String keyword);

    // ✅ Stats bar on the homepage — real counts, not placeholder numbers
    long countByStatus(AdStatus status);

    @Query("SELECT COUNT(DISTINCT a.vendor.vendorId) FROM Ad a WHERE a.status = :status")
    long countDistinctVendorsByStatus(@Param("status") AdStatus status);

    @Query("SELECT AVG(r.ratingValue) FROM Rating r")
    Double findOverallAverageRating();

    // ✅ For the admin "ads by plan" pie chart
    @Query("SELECT a.subscriptionPlan.planName, COUNT(a) FROM Ad a WHERE a.status = :status GROUP BY a.subscriptionPlan.planName")
    List<Object[]> countByPlanNameAndStatus(@Param("status") AdStatus status);
}
