package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "account_item")
public class AccountItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_item_id")
    private Integer accountItemId;

    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "account_email")
    private String accountEmail;

    @Column(name = "account_password")
    private String accountPassword;

    @Column(name = "item_status_id")
    private Integer itemStatusId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
