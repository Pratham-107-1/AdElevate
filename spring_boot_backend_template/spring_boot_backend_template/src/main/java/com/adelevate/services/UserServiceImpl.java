package com.adelevate.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.adelevate.entities.User;
import com.adelevate.enums.Role;
import com.adelevate.enums.Status;
import com.adelevate.repositories.UserRepository;
import com.adelevate.dtos.user.UserRequestDto;
import com.adelevate.dtos.user.UpdateUserRequest;
import com.adelevate.dtos.user.UserRegisterDto;
import com.adelevate.dtos.user.UserResponseDto;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // ✅ injected from SecurityConfig

    @Override
    public User register(UserRequestDto dto) {
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());

        // ✅ Encrypt password before saving
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        user.setPhoneNumber(dto.getPhoneNumber());
        user.setRole(Role.valueOf(dto.getRole().toUpperCase()));   // ✅ Enum conversion
        user.setStatus(Status.valueOf(dto.getStatus().toUpperCase())); // ✅ Enum conversion
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    
    
    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    
    @Override
    public UserResponseDto updateUserById(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) user.setName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getPassword() != null) {
            // ✅ Encrypt updated password
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return toDto(user);
    }

    @Override
    public void deleteUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(user);
    }

    private UserResponseDto toDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().name());
        dto.setStatus(user.getStatus().name());
        return dto;
    }

    @Override
    public UserResponseDto registerUser(UserRegisterDto request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // ✅ Encrypt password before saving
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));   // ✅ Enum conversion
        user.setStatus(Status.valueOf(request.getStatus().toUpperCase())); // ✅ Enum conversion
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return toDto(savedUser); // ✅ Convert entity to response DTO
    }

}
