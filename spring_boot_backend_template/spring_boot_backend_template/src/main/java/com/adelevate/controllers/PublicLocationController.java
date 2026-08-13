package com.adelevate.controllers;

import com.adelevate.dtos.location.LocationDto;
import com.adelevate.services.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// ✅ Public, read-only view of locations - powers the Home page search
// dropdown and the ad-posting City dropdown, both of which need to work
// for logged-out visitors / vendors, unlike /api/admin/locations which is
// correctly restricted to admins for adding/editing/deleting.
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class PublicLocationController {

    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<List<LocationDto>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }
}
