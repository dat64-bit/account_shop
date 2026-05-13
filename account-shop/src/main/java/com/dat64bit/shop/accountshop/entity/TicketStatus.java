package com.dat64bit.shop.accountshop.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ticket_status")
public class TicketStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_status_id")
    private Integer ticketStatusId;

    @Column(name = "status_name")
    private String statusName;

    @Column(name = "description")
    private String description;

}
