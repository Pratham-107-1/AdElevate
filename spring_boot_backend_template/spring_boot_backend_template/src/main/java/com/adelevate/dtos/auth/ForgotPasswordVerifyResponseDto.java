package com.adelevate.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class ForgotPasswordVerifyResponseDto {
    private boolean exists;
    private String message;
}
