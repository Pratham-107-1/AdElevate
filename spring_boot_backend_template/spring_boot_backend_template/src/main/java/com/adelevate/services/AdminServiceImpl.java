package com.adelevate.services;

//import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.adelevate.entities.Admin;
import com.adelevate.entities.User;
import com.adelevate.repositories.AdminRepository;
import com.adelevate.repositories.UserRepository;
import com.adelevate.dtos.admin.AdminResponseDto;
import com.adelevate.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
//    private final ModelMapper modelMapper;

    private AdminResponseDto mapToResponse(Admin admin) {
        AdminResponseDto dto = new AdminResponseDto();
        User user = admin.getUser();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStatus(user.getStatus().name());
        dto.setRole(user.getRole().name());
        dto.setLastLogin(admin.getLastLogin() != null ? admin.getLastLogin().toString() : null);
        return dto;
    }

    @Override
    public AdminResponseDto createAdmin(User user) {
        User managedUser = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Admin admin = new Admin();
        admin.setUser(managedUser);
        admin.setLastLogin(LocalDateTime.now());

        Admin savedAdmin = adminRepository.save(admin);
        return mapToResponse(savedAdmin);
    }

    @Override
    public AdminResponseDto getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + id));
        return mapToResponse(admin);
    }

    @Override
    public List<AdminResponseDto> getAllAdmins() {
        return adminRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
