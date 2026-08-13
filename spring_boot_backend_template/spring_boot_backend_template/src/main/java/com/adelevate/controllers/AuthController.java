package com.adelevate.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import com.adelevate.securityConfig.JwtUtil;
import com.adelevate.clients.LoggingServiceClient;
import com.adelevate.services.AdminService;
import com.adelevate.services.BusinessVendorService;
import com.adelevate.services.CustomerService;
import com.adelevate.services.UserService;
import com.adelevate.repositories.AdminRepository;
import com.adelevate.repositories.UserRepository;
import com.adelevate.entities.Admin;
import com.adelevate.entities.User;
import com.adelevate.enums.Role;
import com.adelevate.dtos.auth.AuthLoginRequestDto;
import com.adelevate.dtos.auth.AuthLoginResponseDto;
import com.adelevate.dtos.auth.ForgotPasswordVerifyRequestDto;
import com.adelevate.dtos.auth.ForgotPasswordVerifyResponseDto;
import com.adelevate.dtos.auth.ResetPasswordRequestDto;
import com.adelevate.dtos.user.UserRequestDto;
import com.adelevate.dtos.user.UserResponseDto;

import com.adelevate.exception.ResourceNotFoundException;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final CustomerService customerService;
    private final BusinessVendorService businessVendorService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AdminService adminService;
    private final AdminRepository adminRepository;
    private final LoggingServiceClient loggingServiceClient;

    // ✅ Register endpoint
    @PostMapping("/register")
    @Transactional
    public ResponseEntity<UserResponseDto> registerUser(@RequestBody @Valid UserRequestDto dto) {
        User savedUser = userService.register(dto);

        if (savedUser.getRole() == Role.CUSTOMER) {
            customerService.createCustomer(savedUser);
        } else if (savedUser.getRole() == Role.VENDOR) {
            businessVendorService.createVendor(savedUser, dto.getBusinessName(), dto.getBusinessCategory());
        } else if (savedUser.getRole() == Role.ADMIN) {
            adminService.createAdmin(savedUser);
        }

        loggingServiceClient.logEvent(
                "REGISTER",
                savedUser.getName() + " registered as " + savedUser.getRole().name(),
                savedUser.getUserId(),
                savedUser.getEmail());

        return ResponseEntity.ok(userService.getUserById(savedUser.getUserId()));
    }

    // ✅ Login endpoint
    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponseDto> login(@RequestBody AuthLoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(null);
        }

        // ✅ If Admin, update lastLogin
        if (user.getRole() == Role.ADMIN) {
            Admin admin = adminRepository.findById(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);
        }

        // ✅ Enum ko "ROLE_" prefix ke saath convert karo
        List<String> roles = List.of("ROLE_" + user.getRole().name());

        // ✅ Token generate with roles
        String token = jwtUtil.generateToken(user.getEmail(), roles);

        AuthLoginResponseDto response = new AuthLoginResponseDto(
                token,
                user.getUserId(),
                user.getRole().name(),
                user.getEmail(),
                user.getName()
        );

        loggingServiceClient.logEvent(
                "LOGIN",
                user.getName() + " (" + user.getRole().name() + ") logged in",
                user.getUserId(),
                user.getEmail());

        return ResponseEntity.ok(response);
    }

    // ✅ Forgot password — step 1: verify the account exists
    //
    // ⚠️ Security note: this confirms account existence and lets the caller
    // move straight to setting a new password, with no proof they actually
    // own that email/phone (no OTP, no emailed reset link). That matches
    // what was asked for, but it means anyone who knows (or guesses) a
    // user's email/phone can reset their password. A real production
    // version should send a one-time code or a signed reset link to the
    // email/phone instead of allowing an immediate password change here.
    @PostMapping("/forgot-password/verify")
    public ResponseEntity<ForgotPasswordVerifyResponseDto> verifyForgotPassword(
            @RequestBody @Valid ForgotPasswordVerifyRequestDto dto) {

        Optional<User> user = findByEmailOrPhone(dto.getEmailOrPhone());

        if (user.isPresent()) {
            return ResponseEntity.ok(
                    new ForgotPasswordVerifyResponseDto(true, "Account found. You can now set a new password."));
        }
        return ResponseEntity.status(404).body(
                new ForgotPasswordVerifyResponseDto(false, "No account found with that email or phone number."));
    }

    // ✅ Forgot password — step 2: set the new password
    @PutMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody @Valid ResetPasswordRequestDto dto) {
        User user = findByEmailOrPhone(dto.getEmailOrPhone())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with that email or phone number."));

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully. You can now log in with your new password.");
    }

    private Optional<User> findByEmailOrPhone(String emailOrPhone) {
        Optional<User> byEmail = userRepository.findByEmail(emailOrPhone);
        if (byEmail.isPresent()) {
            return byEmail;
        }
        return userRepository.findByPhoneNumber(emailOrPhone);
    }

}
