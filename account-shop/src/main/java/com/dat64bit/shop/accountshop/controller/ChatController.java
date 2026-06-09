package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.ChatMessage;
import com.dat64bit.shop.accountshop.entity.Account;
import com.dat64bit.shop.accountshop.entity.Conversation;
import com.dat64bit.shop.accountshop.entity.Message;
import com.dat64bit.shop.accountshop.repository.AccountRepository;
import com.dat64bit.shop.accountshop.repository.ConversationRepository;
import com.dat64bit.shop.accountshop.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messageRepository;
    private final AccountRepository accountRepository;
    private final ConversationRepository conversationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendToAdmin")
    public void sendToAdmin(@Payload ChatMessage chatMessage) {
        try {
            Account sender = accountRepository.findByUsername(chatMessage.getSender()).orElse(null);
            Integer senderId = (sender != null) ? sender.getAccountId() : null;

            // Tìm conversation của User, hoặc tạo mới nếu cần. Thường thì REST API history đã tạo.
            Conversation conv = null;
            if (senderId != null) {
                conv = conversationRepository.findByParticipantOneId(senderId).orElse(null);
            }

            if (conv != null) {
                Message msg = Message.builder()
                        .conversationId(conv.getConversationId())
                        .senderId(senderId)
                        .messageContent(chatMessage.getContent())
                        .messageType(chatMessage.getType() != null ? chatMessage.getType() : "CHAT")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                messageRepository.save(msg);
                
                // Cập nhật updatedAt
                conv.setUpdatedAt(LocalDateTime.now());
                conversationRepository.save(conv);

                chatMessage.setConversationId(conv.getConversationId());
                chatMessage.setAccountId(senderId);
            }

        } catch (Exception e) {
            System.err.println("Không thể lưu tin nhắn: " + e.getMessage());
        }

        chatMessage.setTimestamp(String.valueOf(System.currentTimeMillis()));

        // Broadcast cho bản thân Khách hàng (để hiện tin nhắn vừa gửi nếu cần)
        if (chatMessage.getAccountId() != null) {
            messagingTemplate.convertAndSend("/topic/user." + chatMessage.getAccountId(), chatMessage);
        }
        // Broadcast cho tất cả Admin đang online
        messagingTemplate.convertAndSend("/topic/admin", chatMessage);
    }

    @MessageMapping("/chat.sendToUser")
    public void sendToUser(@Payload ChatMessage chatMessage) {
        try {
            Integer targetAccountId = chatMessage.getTargetAccountId();
            Conversation conv = null;
            
            if (targetAccountId != null) {
                conv = conversationRepository.findByParticipantOneId(targetAccountId).orElse(null);
            }

            if (conv != null) {
                Message msg = Message.builder()
                        .conversationId(conv.getConversationId())
                        .senderId(null) // Admin gửi
                        .messageContent(chatMessage.getContent())
                        .messageType(chatMessage.getType() != null ? chatMessage.getType() : "CHAT")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                messageRepository.save(msg);
                
                conv.setUpdatedAt(LocalDateTime.now());
                conversationRepository.save(conv);

                chatMessage.setConversationId(conv.getConversationId());
                chatMessage.setAccountId(targetAccountId);
            }
        } catch (Exception e) {
            System.err.println("Không thể lưu tin nhắn Admin gửi: " + e.getMessage());
        }

        chatMessage.setTimestamp(String.valueOf(System.currentTimeMillis()));

        // Gửi tới đích danh Khách hàng
        if (chatMessage.getTargetAccountId() != null) {
            messagingTemplate.convertAndSend("/topic/user." + chatMessage.getTargetAccountId(), chatMessage);
        }
        // Gửi tới phòng Admin để đồng bộ các tab Admin
        messagingTemplate.convertAndSend("/topic/admin", chatMessage);
    }
}
