package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDTO {
    private Integer orderId;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String fulfillmentStatus;
    private String productName; // Thêm tên sản phẩm
    private String accountInfo; // Thêm thông tin tài khoản (Email|Pass|Slot)
    private LocalDateTime createdAt;
}
