package com.adelevate.dtos.businessVendor;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class BusinessVendorResponseDto {

    private String businessName;
    private String businessCategory;
    private String email;   // from linked User
    private String phoneNumber; 

}

