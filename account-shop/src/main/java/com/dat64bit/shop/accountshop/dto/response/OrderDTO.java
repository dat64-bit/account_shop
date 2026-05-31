package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDTO {
    private Integer orderId;
    private Integer orderDetailId;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String fulfillmentStatus;
    private String productName; // Thêm tên sản phẩm
    private String accountInfo; // Thêm thông tin tài khoản (Email|Pass|Slot)
    private String username; // Thêm username của khách hàng
    private String fullName; // Thêm tên đầy đủ của khách hàng
    private LocalDateTime createdAt;
}
