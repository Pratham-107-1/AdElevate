package com.adelevate.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.adelevate.entities.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {
}
