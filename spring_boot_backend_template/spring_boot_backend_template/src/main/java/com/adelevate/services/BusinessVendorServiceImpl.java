package com.adelevate.services;

import com.adelevate.dtos.businessVendor.BusinessVendorRequestDto;
import com.adelevate.dtos.businessVendor.BusinessVendorResponseDto;
import com.adelevate.entities.BusinessVendor;
import com.adelevate.entities.User;
import com.adelevate.repositories.BusinessVendorRepository;
import com.adelevate.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusinessVendorServiceImpl implements BusinessVendorService {

    private final BusinessVendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Transactional
    @Override
    public BusinessVendorResponseDto createVendor(User user, String businessName, String businessCategory) {
        User managedUser = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BusinessVendor vendor = new BusinessVendor();
        vendor.setUser(managedUser);
        vendor.setBusinessName(businessName);
        vendor.setBusinessCategory(businessCategory);

        BusinessVendor savedVendor = vendorRepository.save(vendor);
        return modelMapper.map(savedVendor, BusinessVendorResponseDto.class);
    }

    @Override
    public BusinessVendorResponseDto createVendor(BusinessVendorRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        BusinessVendor vendor = new BusinessVendor();
        vendor.setUser(user);
        vendor.setBusinessName(dto.getBusinessName());
        vendor.setBusinessCategory(dto.getBusinessCategory());

        BusinessVendor savedVendor = vendorRepository.save(vendor);
        return modelMapper.map(savedVendor, BusinessVendorResponseDto.class);
    }

    @Override
    public BusinessVendorResponseDto getVendorById(Long id) {
        BusinessVendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return modelMapper.map(vendor, BusinessVendorResponseDto.class);
    }

    @Override
    public List<BusinessVendorResponseDto> getAllVendors() {
        return vendorRepository.findAll()
                .stream()
                .map(v -> modelMapper.map(v, BusinessVendorResponseDto.class))
                .toList();
    }

    @Override
    public BusinessVendorResponseDto updateVendor(Long id, BusinessVendorRequestDto dto) {
        BusinessVendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        vendor.setBusinessName(dto.getBusinessName());
        vendor.setBusinessCategory(dto.getBusinessCategory());

        BusinessVendor updatedVendor = vendorRepository.save(vendor);
        return modelMapper.map(updatedVendor, BusinessVendorResponseDto.class);
    }

    @Override
    public void deleteVendor(Long id) {
        BusinessVendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendorRepository.delete(vendor);
    }
}
