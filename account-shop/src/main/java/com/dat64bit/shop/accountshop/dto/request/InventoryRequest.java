package com.dat64bit.shop.accountshop.dto.request;

import lombok.Data;

@Data
public class InventoryRequest {
    private Integer productId;
    private String emailOrUsername;
    private String password;
    // Dành cho account share
    private Integer maxSlots; 
    private Integer itemStatusId;
}
