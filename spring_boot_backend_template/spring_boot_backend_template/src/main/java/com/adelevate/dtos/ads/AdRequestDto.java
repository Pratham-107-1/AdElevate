package com.adelevate.dtos.ads;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdRequestDto {
	    private String title;  
	    private String city;  
	    private String priceRange;  // ₹999–₹4,999 or ₹299/visit
	    private String category; 
	    private String description;
	    private String productImage;  
	       
	    private Double minPrice;
	    private Double maxPrice;
	    private LocalDate expirationDate; 
	    private Long vendorId;
	    private Long planId;
	    // locationId removed — createAd() now finds-or-creates a Location from
	    // the `city` field above, so vendors never need to know a locationId.
         
}
