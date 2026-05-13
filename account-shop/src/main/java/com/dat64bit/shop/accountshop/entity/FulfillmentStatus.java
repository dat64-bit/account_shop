package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "fulfillment_status")
public class FulfillmentStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fulfillment_status_id")
    private Integer fulfillmentStatusId;

    @Column(name = "status_name")
    private String statusName;

    @Column(name = "description")
    private String description;

}
