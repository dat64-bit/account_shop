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
@Table(name = "order_detail")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_id")
    private Integer orderDetailId;

    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "product_subscription_id")
    private Integer productSubscriptionId;

    @Column(name = "price")
    private BigDecimal price;

    @Column(name = "item_type_id")
    private Integer itemTypeId;

    @Column(name = "account_slot_id")
    private Integer accountSlotId;

    @Column(name = "account_item_id")
    private Integer accountItemId;

    @Column(name = "customer_provided_info")
    private String customerProvidedInfo;

    @Column(name = "fulfillment_status_id")
    private Integer fulfillmentStatusId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
