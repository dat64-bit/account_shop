package com.dat64bit.shop.accountshop.dto.request;

import lombok.Data;

@Data
public class TicketRequest {
    private Integer orderDetailId;
    private String issueType;
    private String message;
}
