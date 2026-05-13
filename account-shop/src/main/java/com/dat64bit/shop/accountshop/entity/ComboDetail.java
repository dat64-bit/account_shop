package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "combo_detail")
public class ComboDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "combo_detail_id")
    private Integer comboDetailId;

    @Column(name = "combo_id")
    private Integer comboId;

    @Column(name = "product_subscription_id")
    private Integer productSubscriptionId;

}
