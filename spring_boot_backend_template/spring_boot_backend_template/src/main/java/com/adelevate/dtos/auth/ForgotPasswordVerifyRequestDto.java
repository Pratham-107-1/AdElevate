package com.adelevate.dtos.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ForgotPasswordVerifyRequestDto {

    @NotBlank(message = "Email or phone number is required")
    private String emailOrPhone;
}
