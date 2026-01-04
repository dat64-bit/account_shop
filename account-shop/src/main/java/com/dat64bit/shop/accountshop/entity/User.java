package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Account") // Ten bang trong SQL server
@NoArgsConstructor
@AllArgsConstructor
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int AccountID;
    @Column(name = "Username", unique = true,  nullable = false)
    private String username;
    @Column(name = "PasswordHash", nullable = false, columnDefinition = "VARCHAR(255)")
    private String password;
    @Nationalized
    @Column(name = "FullName",columnDefinition = "NVARCHAR(100)")
    private String fullName;
    @Column(columnDefinition = "VARCHAR(100)",unique = true)
    private String email;
    @Column(name = "PhoneNumber", columnDefinition = "CHAR(10)")
    private String phoneNumber;
    @Column(name = "Balance", precision = 18)
    private BigDecimal balance;
    @Column(name = "role", columnDefinition = "Role",nullable = false)
    private String role;
    @Column(name = "CreatedAt", insertable = false, updatable = false, columnDefinition = "DATETIME DEFAULT GETDATE()")
    private LocalDateTime createdAt;
    private String status;
}
