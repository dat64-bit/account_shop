package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "account_slot")
public class AccountSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_slot_id")
    private Integer accountSlotId;

    @Column(name = "account_item_id")
    private Integer accountItemId;

    @Column(name = "slot_name")
    private String slotName;

    @Column(name = "pin_code")
    private String pinCode;

    @Column(name = "slot_status_id")
    private Integer slotStatusId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
