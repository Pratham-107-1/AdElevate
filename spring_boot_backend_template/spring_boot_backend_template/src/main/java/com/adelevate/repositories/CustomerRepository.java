package com.adelevate.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.adelevate.entities.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
