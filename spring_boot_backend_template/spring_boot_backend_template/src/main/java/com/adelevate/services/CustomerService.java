package com.adelevate.services;

import com.adelevate.dtos.customer.CustomerResponseDto;
import com.adelevate.entities.User;

import java.util.List;

public interface CustomerService {
    CustomerResponseDto createCustomer(User user);   // ✅ create customer linked to user
    CustomerResponseDto getCustomerById(Long id);    // ✅ fetch by ID
    List<CustomerResponseDto> getAllCustomers();     // ✅ fetch all
}
