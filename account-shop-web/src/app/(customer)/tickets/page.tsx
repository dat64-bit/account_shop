"use client";

import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import api from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config';

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
  type?: string;
  orderId?: number;
  accountId?: number;
  conversationId?: number;
}

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

      <div ref={messagesContainerRef} className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f8fafc' }}>
        {loadingHistory && <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>Đang tải lịch sử...</div>}

        {messages.map((msg, idx) => {
          const isMe = userInfo && (msg.sender === userInfo.username);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', padding: '0 4px' }}>
                {isMe ? 'Bạn' : 'Hỗ trợ viên'}
              </div>
              <div style={{
                background: isMe ? '#2563eb' : '#ffffff',
                color: isMe ? '#ffffff' : '#0f172a',
                padding: '12px 16px',
                borderRadius: '12px',
                borderBottomRightRadius: isMe ? '4px' : '12px',
                borderBottomLeftRadius: !isMe ? '4px' : '12px',
                maxWidth: '70%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                border: isMe ? 'none' : '1px solid #e2e8f0'
              }}>
                {msg.type === 'ORDER_REFERENCE' && (
                  <div style={{ marginBottom: 8, padding: '6px 10px', background: isMe ? 'rgba(255,255,255,0.2)' : '#f8fafc', borderRadius: 6, fontSize: 13, border: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e2e8f0' }}>
                    <strong>Tham chiếu đơn hàng:</strong> #{msg.orderId}
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input-area" style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', background: '#fff', alignItems: 'center' }}>
        <select
          value={selectedOrderId}
          onChange={e => setSelectedOrderId(e.target.value)}
          disabled={!connected}
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: 13, maxWidth: '150px' }}
        >
          <option value="">(Không đính kèm mã đơn)</option>
          {orders.map(o => (
            <option key={o.orderId} value={o.orderId}>#{o.orderId} - {o.productName}</option>
          ))}
        </select>
        <input
          type="text"
          className="form-input"
          placeholder="Nhập tin nhắn..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          disabled={!connected}
        />
        <button
          className="btn-primary"
          onClick={sendMessage}
          disabled={!connected || !inputMessage.trim()}
          style={{ padding: '0 24px', borderRadius: '8px', fontWeight: 600 }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
