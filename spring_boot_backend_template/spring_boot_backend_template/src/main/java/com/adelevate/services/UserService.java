package com.adelevate.services;

import com.adelevate.dtos.user.UserRegisterDto;
import com.adelevate.dtos.user.UserRequestDto;

import java.util.List;

import com.adelevate.dtos.user.UpdateUserRequest;
import com.adelevate.dtos.user.UserResponseDto;
import com.adelevate.entities.User;

public interface UserService {
    UserResponseDto registerUser(UserRegisterDto request);
    UserResponseDto updateUserById(Long id, UpdateUserRequest request);
    void deleteUserById(Long id);
    UserResponseDto getUserById(Long id);
    public User register(UserRequestDto dto);
    List<UserResponseDto> getAllUsers();


}
