package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminInventoryDTO {
    private Integer accountItemId;
    private Integer productId;
    private String productName;
    private String accountEmail;
    private String accountPassword;
    private Integer itemStatusId;
    private String statusName;
    private LocalDateTime createdAt;
    
    // Thống kê Slot cho tài khoản dùng chung (ADR-008)
    private Integer totalSlots;
    private Integer soldSlots;
    private Integer freeSlots;
}
