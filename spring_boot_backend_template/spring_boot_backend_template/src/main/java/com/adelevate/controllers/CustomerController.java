package com.adelevate.controllers;

import com.adelevate.dtos.customer.CustomerResponseDto;
import com.adelevate.entities.User;
import com.adelevate.services.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // ✅ Create customer (after user registration)
    @PostMapping
    public ResponseEntity<CustomerResponseDto> createCustomer(@RequestBody User user) {
        CustomerResponseDto response = customerService.createCustomer(user);
        return ResponseEntity.ok(response);
    }

    // ✅ Get customer by ID
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponseDto> getCustomerById(@PathVariable Long id) {
        CustomerResponseDto response = customerService.getCustomerById(id);
        return ResponseEntity.ok(response);
    }

    // ✅ Get all customers
    @GetMapping
    public ResponseEntity<List<CustomerResponseDto>> getAllCustomers() {
        List<CustomerResponseDto> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }
}
