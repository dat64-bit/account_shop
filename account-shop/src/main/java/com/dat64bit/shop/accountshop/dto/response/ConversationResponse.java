package com.dat64bit.shop.accountshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private Integer conversationId;
    private Integer accountId;
    private String username;
    private String lastMessage;
    private String lastMessageTimestamp;
    private boolean hasUnread;
}
