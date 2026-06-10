package com.dat64bit.shop.accountshop.controller;

import com.dat64bit.shop.accountshop.dto.common.ChatMessage;
import com.dat64bit.shop.accountshop.dto.response.ConversationResponse;
import com.dat64bit.shop.accountshop.entity.Account;
import com.dat64bit.shop.accountshop.entity.Conversation;
import com.dat64bit.shop.accountshop.entity.Message;
import com.dat64bit.shop.accountshop.repository.AccountRepository;
import com.dat64bit.shop.accountshop.repository.ConversationRepository;
import com.dat64bit.shop.accountshop.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatRestController {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final AccountRepository accountRepository;

    private Account getCurrentAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
    }

    // --- CUSTOMER APIs ---

    @GetMapping("/user/chat/history")
    public ResponseEntity<?> getUserChatHistory() {
        Account account = getCurrentAccount();
        Integer customerId = account.getAccountId();
        Integer adminId = 1; // Default admin ID

        Integer p1 = Math.min(adminId, customerId);
        Integer p2 = Math.max(adminId, customerId);

        Conversation conv = conversationRepository.findByParticipantOneIdAndParticipantTwoId(p1, p2)
                .orElseGet(() -> {
                    Conversation newConv = Conversation.builder()
                            .participantOneId(p1)
                            .participantTwoId(p2)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return conversationRepository.save(newConv);
                });

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conv.getConversationId());

        // Convert to DTO
        List<ChatMessage> dtos = messages.stream().map(m -> {
            String senderName = m.getSenderId() != null && m.getSenderId().equals(account.getAccountId())
                    ? account.getUsername()
                    : "Admin";
            return ChatMessage.builder()
                    .sender(senderName)
                    .content(m.getMessageContent())
                    .type(m.getMessageType())
                    .timestamp(String.valueOf(
                            m.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()))
                    .accountId(account.getAccountId())
                    .conversationId(conv.getConversationId())
                    .role(m.getSenderId() != null && m.getSenderId().equals(account.getAccountId()) ? "USER" : "ADMIN")
                    .build();
        }).toList();

        return ResponseEntity.ok(dtos);
    }

    // --- ADMIN APIs ---

    @GetMapping("/admin/chat/conversations")
    public ResponseEntity<?> getAdminConversations() {
        List<Conversation> conversations = conversationRepository.findAllByOrderByUpdatedAtDesc();
        List<ConversationResponse> response = new ArrayList<>();

        for (Conversation conv : conversations) {
            if (conv.getParticipantOneId() == null)
                continue;

            Account p1 = accountRepository.findById(conv.getParticipantOneId()).orElse(null);
            Account p2 = conv.getParticipantTwoId() != null ? accountRepository.findById(conv.getParticipantTwoId()).orElse(null) : null;
            Account user = null;
            if (p1 != null && p1.getRoleId() == 2) {
                user = p1;
            } else if (p2 != null && p2.getRoleId() == 2) {
                user = p2;
            }

            String username = user != null ? user.getUsername() : "Khách ẩn danh";
            Integer customerId = user != null ? user.getAccountId() : conv.getParticipantTwoId();

            Message lastMsg = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conv.getConversationId());
            String msgContent = lastMsg != null ? lastMsg.getMessageContent() : "Bắt đầu cuộc trò chuyện";
            String msgTime = lastMsg != null
                    ? String.valueOf(
                            lastMsg.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli())
                    : null;

            response.add(ConversationResponse.builder()
                    .conversationId(conv.getConversationId())
                    .accountId(customerId)
                    .username(username)
                    .lastMessage(msgContent)
                    .lastMessageTimestamp(msgTime)
                    .hasUnread(false) // Có thể cải tiến đếm unread sau
                    .build());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/chat/{conversationId}/messages")
    public ResponseEntity<?> getAdminChatHistory(@PathVariable Integer conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại"));

        Account p1 = accountRepository.findById(conv.getParticipantOneId()).orElse(null);
        Account p2 = conv.getParticipantTwoId() != null ? accountRepository.findById(conv.getParticipantTwoId()).orElse(null) : null;
        Account user = null;
        if (p1 != null && p1.getRoleId() == 2) {
            user = p1;
        } else if (p2 != null && p2.getRoleId() == 2) {
            user = p2;
        }

        String username = user != null ? user.getUsername() : "Khách ẩn danh";
        Integer customerId = user != null ? user.getAccountId() : conv.getParticipantTwoId();

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        List<ChatMessage> dtos = messages.stream().map(m -> {
            boolean isUser = m.getSenderId() != null && m.getSenderId().equals(customerId);
            return ChatMessage.builder()
                    .sender(isUser ? username : "Admin")
                    .content(m.getMessageContent())
                    .type(m.getMessageType())
                    .timestamp(String.valueOf(
                            m.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()))
                    .accountId(customerId)
                    .conversationId(conversationId)
                    .role(isUser ? "USER" : "ADMIN")
                    .build();
        }).toList();

        return ResponseEntity.ok(dtos);
    }
}
