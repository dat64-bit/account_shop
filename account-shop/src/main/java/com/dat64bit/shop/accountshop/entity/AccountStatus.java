package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "account_status")
public class AccountStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_status_id")
    private Integer accountStatusId;

    @Column(name = "status_name")
    private String statusName;

    @Column(name = "description")
    private String description;

}
