package com.adelevate.dtos.user;

import com.adelevate.enums.Status;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UpdateUserRequest {

    @Size(min = 3, max = 50, message = "Full name must be between 3 and 50 characters")
    private String fullName;

    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Enter a valid 10-digit Indian mobile number"
    )
    private String phoneNumber;

    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    private Status status; // ACTIVE/INACTIVE (optional)
}
