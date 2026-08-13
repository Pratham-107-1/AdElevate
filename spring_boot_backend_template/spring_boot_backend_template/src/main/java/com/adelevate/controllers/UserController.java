package com.adelevate.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.adelevate.services.UserService;
import com.adelevate.services.AdminService;
import com.adelevate.services.BusinessVendorService;
import com.adelevate.services.CustomerService;
import com.adelevate.dtos.user.UserRequestDto;
import com.adelevate.dtos.user.UpdateUserRequest;
import com.adelevate.dtos.user.UserResponseDto;
import com.adelevate.entities.User;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CustomerService customerService;
    private final BusinessVendorService businessVendorService;
    private final AdminService adminService;

    // ✅ Register new user
    @Transactional
    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> registerUser(@RequestBody @Valid UserRequestDto dto) {
        User savedUser = userService.register(dto);

        switch (savedUser.getRole()) {
            case CUSTOMER -> customerService.createCustomer(savedUser);
            case VENDOR -> businessVendorService.createVendor(savedUser, dto.getBusinessName(), dto.getBusinessCategory());
            case ADMIN -> adminService.createAdmin(savedUser); // ✅ Admin entry create
            default -> { /* do nothing */ }
        }

        return ResponseEntity.ok(userService.getUserById(savedUser.getUserId()));
    }


    // ✅ Update user by ID
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> update(@PathVariable Long id,
                                                  @RequestBody @Valid UpdateUserRequest dto) {
        return ResponseEntity.ok(userService.updateUserById(id, dto));
    }

    // ✅ Delete user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ✅ Get all users
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
