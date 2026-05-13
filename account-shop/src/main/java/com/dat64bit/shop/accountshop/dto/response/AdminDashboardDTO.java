package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AdminDashboardDTO {
    private long totalUsers;
    private long totalOrdersToday;
    private BigDecimal totalRevenue;
    private long pendingTickets;
}
