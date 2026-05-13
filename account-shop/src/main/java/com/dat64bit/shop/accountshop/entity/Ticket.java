package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Integer ticketId;

    @Column(name = "account_id")
    private Integer accountId;

    @Column(name = "order_detail_id")
    private Integer orderDetailId;

    @Column(name = "issue_type")
    private String issueType;

    @Column(name = "ticket_status_id")
    private Integer ticketStatusId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
