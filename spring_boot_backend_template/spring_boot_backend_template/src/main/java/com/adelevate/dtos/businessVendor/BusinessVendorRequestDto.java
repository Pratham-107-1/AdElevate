package com.adelevate.dtos.businessVendor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class BusinessVendorRequestDto {

    @NotBlank(message = "Business name is required")
    @Size(max = 100, message = "Business name must not exceed 100 characters")
    private String businessName;

    @NotBlank(message = "Business category is required")
    @Size(max = 50, message = "Business category must not exceed 50 characters")
    private String businessCategory;
    
    @Email(message = "Enter a valid email address")
    private String email; // ✅ Added for linking with User
}

