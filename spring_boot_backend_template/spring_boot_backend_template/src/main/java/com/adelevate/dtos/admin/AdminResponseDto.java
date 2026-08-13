package com.adelevate.dtos.admin;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdminResponseDto {
    private String name;
    private String email;
    private String phoneNumber;
    private String status;
    private String role;
    private String lastLogin;
}
