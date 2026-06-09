package com.dat64bit.shop.accountshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String sender;
    private String content;
    private String timestamp;
    private String type; // Tùy chọn, ví dụ: CHAT, JOIN, LEAVE, ORDER_REFERENCE
    private Integer orderId; // Để đáp ứng yêu cầu đính kèm mã đơn hàng
    private Integer accountId; // ID của Khách hàng trong đoạn chat
    private Integer conversationId; // Mã hội thoại
    private Integer targetAccountId; // Dùng cho Admin khi gửi tin nhắn cho một Khách hàng cụ thể
}
