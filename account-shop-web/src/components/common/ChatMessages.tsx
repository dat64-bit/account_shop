"use client";

import React from 'react';

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
  type?: string;
  orderId?: number;
  accountId?: number;
  conversationId?: number;
  targetAccountId?: number;
  role?: string;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading?: boolean;
  isMe: (msg: ChatMessage) => boolean;
  getSenderName: (msg: ChatMessage) => string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessages({
  messages,
  loading = false,
  isMe,
  getSenderName,
  containerRef
}: ChatMessagesProps) {
  return (
    <div
      ref={containerRef}
      className="chat-messages"
      style={{ flex: 1 }}
    >
      {loading && <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>Đang nạp tin nhắn...</div>}

      {!loading && messages.map((msg, idx) => {
        const me = isMe(msg);
        const senderDisplayName = getSenderName(msg);
        return (
          <div key={idx} className={`chat-bubble-container ${me ? 'me' : 'other'}`}>
            <div className="chat-sender-name">
              {senderDisplayName}
            </div>
            <div className={`bubble-content ${me ? 'admin-bubble' : 'user-bubble'}`}>
              {msg.type === 'ORDER_REFERENCE' && (
                <div className={`chat-order-ref ${me ? 'me' : 'other'}`}>
                  <strong>Tham chiếu đơn hàng:</strong> #{msg.orderId}
                </div>
              )}
              {msg.content}
              {msg.timestamp && (
                <div className="bubble-timestamp">
                  {isNaN(Number(msg.timestamp)) ? msg.timestamp : new Date(parseInt(msg.timestamp)).toLocaleTimeString('vi-VN')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
