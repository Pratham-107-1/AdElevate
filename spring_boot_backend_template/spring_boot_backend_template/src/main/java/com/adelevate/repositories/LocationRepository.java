package com.adelevate.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.adelevate.entities.Location;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByCityIgnoreCase(String city);
}
