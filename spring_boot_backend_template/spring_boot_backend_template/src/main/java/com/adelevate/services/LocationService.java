package com.adelevate.services;

import com.adelevate.dtos.location.LocationDto;

import java.util.List;

public interface LocationService {
    LocationDto createLocation(LocationDto dto);
    LocationDto getLocationById(Long id);
    List<LocationDto> getAllLocations();
    LocationDto updateLocation(Long id, LocationDto dto);
    void deleteLocation(Long id);
}
