package com.adelevate.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.adelevate.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
}
