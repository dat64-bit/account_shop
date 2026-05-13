package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payment_method")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id")
    private Integer paymentMethodId;

    @Column(name = "method_name")
    private String methodName;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;

}
