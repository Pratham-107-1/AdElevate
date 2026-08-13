package com.adelevate.dtos.images;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class AdImageDto {
    private String filename;
    private String url; // full URL the frontend can use directly as productImage
}
