package com.dat64bit.shop.accountshop.dto.request;

import java.math.BigDecimal;

public class SepayWebhookRequest {
    private Long id;
    private String gateway;
    private String transactionDate;
    private String accountNumber;
    private String subAccount;
    private BigDecimal amountIn;
    private BigDecimal amountOut;
    private BigDecimal accumulated;
    private String code;
    private String transactionContent;
    private String referenceNumber;
    private String body;
    private String description;
    
    // Some newer versions or different formats use these fields:
    private String content;
    private String transferType;
    private BigDecimal transferAmount;
    private String referenceCode;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGateway() { return gateway; }
    public void setGateway(String gateway) { this.gateway = gateway; }
    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getSubAccount() { return subAccount; }
    public void setSubAccount(String subAccount) { this.subAccount = subAccount; }
    public BigDecimal getAmountIn() { return amountIn; }
    public void setAmountIn(BigDecimal amountIn) { this.amountIn = amountIn; }
    public BigDecimal getAmountOut() { return amountOut; }
    public void setAmountOut(BigDecimal amountOut) { this.amountOut = amountOut; }
    public BigDecimal getAccumulated() { return accumulated; }
    public void setAccumulated(BigDecimal accumulated) { this.accumulated = accumulated; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTransactionContent() { return transactionContent; }
    public void setTransactionContent(String transactionContent) { this.transactionContent = transactionContent; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTransferType() { return transferType; }
    public void setTransferType(String transferType) { this.transferType = transferType; }
    public BigDecimal getTransferAmount() { return transferAmount; }
    public void setTransferAmount(BigDecimal transferAmount) { this.transferAmount = transferAmount; }
    public String getReferenceCode() { return referenceCode; }
    public void setReferenceCode(String referenceCode) { this.referenceCode = referenceCode; }
}
