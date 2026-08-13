package com.adelevate.controllers;

import com.adelevate.dtos.businessVendor.BusinessVendorRequestDto;
import com.adelevate.dtos.businessVendor.BusinessVendorResponseDto;
import com.adelevate.services.BusinessVendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class BusinessVendorController {

    private final BusinessVendorService vendorService;

    @PostMapping
    public ResponseEntity<BusinessVendorResponseDto> createVendor(@RequestBody @Valid BusinessVendorRequestDto dto) {
        return ResponseEntity.ok(vendorService.createVendor(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessVendorResponseDto> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @GetMapping
    public ResponseEntity<List<BusinessVendorResponseDto>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessVendorResponseDto> updateVendor(@PathVariable Long id,
                                                                  @RequestBody @Valid BusinessVendorRequestDto dto) {
        return ResponseEntity.ok(vendorService.updateVendor(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
}
