package com.dat64bit.shop.accountshop.dto.request;

import lombok.Data;

@Data
public class CheckoutRequest {
    private Integer productId;
    private Integer planId; // Thời hạn: 1 tháng, 6 tháng... (ID của subscription_plan)
    private Integer quantity; // Số lượng tài khoản muốn mua
}
