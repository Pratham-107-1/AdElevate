package com.adelevate.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.adelevate.entities.Payment;
import com.adelevate.enums.PaymentStatus;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByVendorId(Long vendorId);
    List<Payment> findByAdId(Long adId);
    Optional<Payment> findByOrderId(String orderId);

    // ✅ For the admin "revenue by plan" pie chart
    @Query("SELECT p.planId, SUM(p.amount), COUNT(p) FROM Payment p WHERE p.status = :status AND p.planId IS NOT NULL GROUP BY p.planId")
    List<Object[]> sumRevenueByPlan(@Param("status") PaymentStatus status);
}
