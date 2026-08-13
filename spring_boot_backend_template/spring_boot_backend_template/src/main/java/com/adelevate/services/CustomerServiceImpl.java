package com.adelevate.services;

//import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

import com.adelevate.entities.Customer;
import com.adelevate.entities.User;
import com.adelevate.exception.ResourceNotFoundException;
import com.adelevate.repositories.CustomerRepository;
import com.adelevate.repositories.UserRepository;

import jakarta.transaction.Transactional;

import com.adelevate.dtos.customer.CustomerResponseDto;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository; // added to fetch managed User
//    private final ModelMapper modelMapper;

    private CustomerResponseDto mapToResponse(Customer customer) {
        CustomerResponseDto dto = new CustomerResponseDto();
        User user = customer.getUser();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStatus(user.getStatus().name());
        return dto;
    }

    @Override
    public CustomerResponseDto createCustomer(User user) {
        // ✅ Ensure managed User
        User managedUser = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = new Customer();
        customer.setUser(managedUser);

        Customer savedCustomer = customerRepository.save(customer);
        return mapToResponse(savedCustomer);
    }


    @Override
    public CustomerResponseDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponse(customer);
    }

    @Override
    public List<CustomerResponseDto> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
