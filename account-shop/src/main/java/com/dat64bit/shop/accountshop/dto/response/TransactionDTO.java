package com.dat64bit.shop.accountshop.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private Integer transactionId;
    private Integer accountId;
    private String username;
    private Integer orderId;
    private BigDecimal amount;
    private Integer transactionTypeId;
    private String transactionTypeName;
    private Integer paymentMethodId;
    private String paymentMethodName;
    private String description;
    private Integer transactionStatusId;
    private String transactionStatusName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
