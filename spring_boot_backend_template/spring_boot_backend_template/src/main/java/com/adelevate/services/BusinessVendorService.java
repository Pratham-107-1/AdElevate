package com.adelevate.services;

import com.adelevate.dtos.businessVendor.BusinessVendorRequestDto;
import com.adelevate.dtos.businessVendor.BusinessVendorResponseDto;
import com.adelevate.entities.User;

import java.util.List;

public interface BusinessVendorService {
    BusinessVendorResponseDto createVendor(User user, String businessName, String businessCategory);
    BusinessVendorResponseDto createVendor(BusinessVendorRequestDto dto);
    BusinessVendorResponseDto getVendorById(Long id);
    List<BusinessVendorResponseDto> getAllVendors();
    BusinessVendorResponseDto updateVendor(Long id, BusinessVendorRequestDto dto);
    void deleteVendor(Long id);
}
