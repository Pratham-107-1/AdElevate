package com.adelevate.dtos.location;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class LocationDto {
    private Long locationId;
    private String city;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
