package com.adelevate.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
public class AuthLoginResponseDto {

    private String token;   // ✅ JWT token
    private Long userId;    // ✅ The logged-in user's ID (== vendorId/customerId, shared PK design)
    private String role;    // ✅ Role of user (ADMIN / CUSTOMER / VENDOR)
    private String email;   // ✅ Optional: return email for confirmation
    private String name;    // ✅ For display purposes (e.g. Navbar "logged in as")
}
