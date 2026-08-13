package com.adelevate.repositories;

import com.adelevate.entities.BusinessVendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface BusinessVendorRepository extends JpaRepository<BusinessVendor, Long> {

    // ✅ Find vendor by email (linked User)
    Optional<BusinessVendor> findByUserEmail(String email);

    // ✅ Find vendor by business name
    Optional<BusinessVendor> findByBusinessName(String businessName);

    // ✅ Find vendors by category (e.g., Restaurants, Electronics)
    List<BusinessVendor> findByBusinessCategory(String category);

    // ✅ Fetch all vendors who have ads (useful for dashboard)
    List<BusinessVendor> findByAdsIsNotEmpty();
}
