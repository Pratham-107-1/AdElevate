package com.adelevate.entities;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "customers") // plural naming convention
@Getter @Setter
public class Customer {

    @Id
    private Long customerId; // same as user_id

    @OneToOne
    @MapsId
    @JoinColumn(name = "customer_id")
    private User user;
}
