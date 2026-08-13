package com.adelevate.dtos.user;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UserResponseDto {
    private Long userId;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
    private String status;
}
