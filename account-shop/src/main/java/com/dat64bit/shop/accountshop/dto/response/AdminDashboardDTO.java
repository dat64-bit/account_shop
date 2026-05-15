package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AdminDashboardDTO {
    private long totalUsers;
    private long totalOrdersToday;
    private BigDecimal totalRevenue;
    private long pendingTickets;

    // Chart data
    private java.util.List<java.math.BigDecimal> revenueTrend;
    private java.util.List<Long> orderTrend;
    private java.util.List<String> topProductNames;
    private java.util.List<Long> topProductSales;
    private java.util.List<Long> topProductPreviousSales;
}
