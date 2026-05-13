package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "[transaction]")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Integer transactionId;

    @Column(name = "account_id")
    private Integer accountId;

    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "transaction_type_id")
    private Integer transactionTypeId;

    @Column(name = "payment_method_id")
    private Integer paymentMethodId;

    @Column(name = "description")
    private String description;

    @Column(name = "transaction_status_id")
    private Integer transactionStatusId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
