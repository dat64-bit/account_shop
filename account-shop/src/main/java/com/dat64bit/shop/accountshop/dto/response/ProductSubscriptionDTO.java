package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductSubscriptionDTO {
    private Integer productSubscriptionId;
    private Integer productId;
    private Integer planId;
    private String planName; // e.g. 1 Month, 6 Months
    private BigDecimal price;
}
