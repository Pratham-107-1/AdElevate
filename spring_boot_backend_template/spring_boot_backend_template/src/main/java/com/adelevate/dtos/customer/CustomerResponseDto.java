package com.adelevate.dtos.customer;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CustomerResponseDto {
    private String name;
    private String email;
    private String phoneNumber;
    private String status;      // ACTIVE / INACTIVE
}
