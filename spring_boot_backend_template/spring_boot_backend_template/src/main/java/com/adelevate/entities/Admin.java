package com.adelevate.entities;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admin")
@Getter @Setter
public class Admin {

    @Id
    private Long adminId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "admin_id")
    private User user;

    private LocalDateTime lastLogin; // ✅ useful for audit/security
}
