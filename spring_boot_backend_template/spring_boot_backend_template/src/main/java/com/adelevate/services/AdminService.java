package com.adelevate.services;

import com.adelevate.dtos.admin.AdminResponseDto;
import com.adelevate.entities.User;
import com.adelevate.enums.AdStatus;

import java.util.List;

public interface AdminService {
    AdminResponseDto createAdmin(User user);
    AdminResponseDto getAdminById(Long id);
    List<AdminResponseDto> getAllAdmins();
    
}
