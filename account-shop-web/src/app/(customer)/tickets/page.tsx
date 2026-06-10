"use client";

import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

import ChatMessages, { ChatMessage } from '@/components/common/ChatMessages';
import ChatInput from '@/components/common/ChatInput';

export default function ChatRoomPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [loadingHistory, setLoadingHistory] = useState(true);

  const stompClientRef = useRef<Client | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const initializeChat = async () => {
      // 1. Fetch User Info
      let currentUser = null;
      try {
        const res = await api.get('/auth/me'); // Dùng đúng endpoint /api/auth/me
        currentUser = res.data;
        setUserInfo(currentUser);
      } catch (err) {
        console.error("Không thể lấy thông tin user", err);
      }

      // 2. Lấy lịch sử đơn hàng
      api.get('/user/orders/my-orders?limit=100').then(res => {
        setOrders(res.data.content || []);
      }).catch(() => { });

      // 3. Nạp lịch sử chat (REST API)
      try {
        const historyRes = await api.get('/user/chat/history');
        setMessages(historyRes.data || []);
      } catch (err) {
        console.error("Không thể lấy lịch sử chat", err);
      }
      setLoadingHistory(false);

      if (!currentUser) return; // Nếu chưa đăng nhập thì không thể connect

      // 4. Khởi tạo kết nối WebSocket
      const client = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws-endpoint`, null, { withCredentials: true } as any),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('Connected to WebSocket');
          setConnected(true);

          // Subscribe vào kênh CÁ NHÂN của khách hàng
          client.subscribe(`/topic/user.${currentUser.accountId}`, (msg) => {
            if (msg.body) {
              const parsedMessage = JSON.parse(msg.body);
              setMessages(prev => {
                // Kiểm tra trùng lặp timestamp (do có thể nhận phản hồi chính mình gửi)
                if (prev.some(m => m.timestamp === parsedMessage.timestamp)) return prev;
                return [...prev, parsedMessage];
              });
            }
          });
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
        },
        onWebSocketClose: () => {
          setConnected(false);
        }
      });

      client.activate();
      stompClientRef.current = client;
    };

    initializeChat();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const sendMessage = () => {
    if (!inputMessage.trim() || !stompClientRef.current || !connected || !userInfo) return;

    const username = userInfo.username || 'Guest';
    const messagePayload: ChatMessage = {
      sender: username,
      content: inputMessage,
      timestamp: String(Date.now()),
      type: selectedOrderId ? 'ORDER_REFERENCE' : 'CHAT',
      orderId: selectedOrderId ? Number(selectedOrderId) : undefined,
      accountId: userInfo.accountId
    };

    // Update locally for instant feedback
    setMessages(prev => [...prev, messagePayload]);

    stompClientRef.current.publish({
      destination: '/app/chat.sendToAdmin',
      body: JSON.stringify(messagePayload)
    });

    setInputMessage('');
    setSelectedOrderId('');
  };

  return (
    <div className="content-card animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div className="card-header ticket-header-flex">
        <div>
          <h2 className="card-title">Phòng Chat Hỗ Trợ</h2>
          <p className="card-subtitle">
            Trạng thái: <span style={{ color: connected ? '#10b981' : '#ef4444', fontWeight: 600 }}>{connected ? 'Đã kết nối' : 'Đang kết nối...'}</span>
          </p>
        </div>
      </div>

      <ChatMessages
        messages={messages}
        loading={loadingHistory}
        isMe={(msg) => msg.role ? msg.role === 'USER' : (!!userInfo && msg.sender === userInfo.username)}
        getSenderName={(msg) => (msg.role ? msg.role === 'USER' : (!!userInfo && msg.sender === userInfo.username)) ? 'Bạn' : 'Hỗ trợ viên'}
        containerRef={messagesContainerRef}
      />

      <ChatInput
        value={inputMessage}
        onChange={setInputMessage}
        onSend={sendMessage}
        disabled={!connected}
        placeholder="Nhập tin nhắn..."
        orders={orders}
        selectedOrderId={selectedOrderId}
        onSelectOrderId={setSelectedOrderId}
      />
    </div>
  );
}
