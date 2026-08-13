package com.adelevate.repositories;

import com.adelevate.entities.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByAdAdIdOrderByCreatedAtDesc(Long adId);
}
