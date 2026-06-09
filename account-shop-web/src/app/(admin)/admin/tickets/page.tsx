"use client";

import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAdminToast } from '@/components/admin/AdminToast';
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
  targetAccountId?: number;
}

interface Conversation {
  conversationId: number;
  accountId: number;
  username: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  hasUnread: boolean;
}

export default function AdminChatRoomPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useAdminToast();

  useEffect(() => {
    if (messagesContainerRef.current) {
      // Dùng scrollTop thay cho scrollIntoView để tránh bị kéo cả trang web
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // 1. Fetch Admin Info
    const storedUserStr = localStorage.getItem('user_info');
    if (storedUserStr) {
      try {
        setUserInfo(JSON.parse(storedUserStr));
      } catch { }
    }

    // 2. Fetch Conversations List
    fetchConversations();

    // 3. Connect WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws-endpoint`, null, { withCredentials: true } as any),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Admin connected to WebSocket');
        setConnected(true);
        showToast('Đã kết nối với Server Chat', 'success');

        // Subscribe vào kênh Admin
        client.subscribe('/topic/admin', (msg) => {
          if (msg.body) {
            const parsedMessage: ChatMessage = JSON.parse(msg.body);

            // Xử lý cập nhật Sidebar
            setConversations(prev => {
              const updated = [...prev];
              const idx = updated.findIndex(c => c.conversationId === parsedMessage.conversationId);

              if (idx >= 0) {
                // Update existing
                updated[idx].lastMessage = parsedMessage.content;
                updated[idx].lastMessageTimestamp = parsedMessage.timestamp;
                if (!selectedConv || selectedConv.conversationId !== parsedMessage.conversationId) {
                  updated[idx].hasUnread = true;
                }
                // Move to top
                const [item] = updated.splice(idx, 1);
                updated.unshift(item);
              } else {
                // Tạm thời nếu có conversation mới cứng thì gọi lại API cho chắc
                fetchConversations();
              }
              return updated;
            });

            // Xử lý cập nhật khung Chat (Nếu đang mở đúng conversation)
            setSelectedConv(currSelected => {
              if (currSelected && currSelected.conversationId === parsedMessage.conversationId) {
                setMessages(prevMsgs => {
                  if (prevMsgs.some(m => m.timestamp === parsedMessage.timestamp)) return prevMsgs;
                  return [...prevMsgs, parsedMessage];
                });
              }
              return currSelected;
            });
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        showToast('Lỗi kết nối Server Chat', 'error');
      },
      onWebSocketClose: () => {
        setConnected(false);
      }
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConversations = async () => {
    try {
      const res = await api.get('/admin/chat/conversations');
      setConversations(res.data || []);
    } catch (e) {
      console.error("Lỗi lấy danh sách chat", e);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingMessages(true);
    setMessages([]); // Clear old messages

    // Đánh dấu đã đọc
    setConversations(prev => prev.map(c => c.conversationId === conv.conversationId ? { ...c, hasUnread: false } : c));

    try {
      const res = await api.get(`/admin/chat/${conv.conversationId}/messages`);
      setMessages(res.data || []);
    } catch (e) {
      console.error("Lỗi lấy tin nhắn", e);
    }
    setLoadingMessages(false);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !stompClientRef.current || !connected || !selectedConv) return;

    const username = userInfo?.username || 'Admin';
    const messagePayload: ChatMessage = {
      sender: username + ' (Admin)',
      content: inputMessage,
      timestamp: String(Date.now()),
      type: 'CHAT',
      targetAccountId: selectedConv.accountId, // Gửi đích danh
      conversationId: selectedConv.conversationId
    };

    // Update locally instantly
    setMessages(prev => [...prev, messagePayload]);

    stompClientRef.current.publish({
      destination: '/app/chat.sendToUser',
      body: JSON.stringify(messagePayload)
    });

    setInputMessage('');
  };

  return (
    <div className="content-card animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <div className="card-header" style={{ paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
        <h2 className="card-title">Quản lý Hỗ Trợ 1-1</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? '#10b981' : '#ef4444' }}></div>
          <span style={{ fontSize: 13, color: '#64748b' }}>{connected ? 'Trực tuyến' : 'Mất kết nối'}</span>
        </div>
      </div>

      <div className="admin-chat-layout" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>

        {/* Sidebar */}
        <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#334155' }}>
            Danh sách ({conversations.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map(conv => (
              <div
                key={conv.conversationId}
                onClick={() => handleSelectConversation(conv)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  background: selectedConv?.conversationId === conv.conversationId ? '#eff6ff' : '#fff',
                  borderLeft: selectedConv?.conversationId === conv.conversationId ? '4px solid #3b82f6' : '4px solid transparent',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {/* Avatar Placeholder */}
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(conv.username)}&background=random&color=fff&size=48`}
                  alt="avatar"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
                
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 15, color: '#0f172a' }}>{conv.username}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{conv.lastMessageTimestamp ? new Date(parseInt(conv.lastMessageTimestamp)).toLocaleDateString('vi-VN') : ''}</span>
                      {conv.hasUnread && <span style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage}
                  </div>
                </div>
              </div>
            ))}
            {conversations.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                Chưa có cuộc trò chuyện nào
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {!selectedConv ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <div style={{ textAlign: 'center' }}>
                <i className="fi fi-rr-messages" style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}></i>
                <p>Chọn một khách hàng ở danh sách bên trái để bắt đầu chat</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', zIndex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#0f172a' }}>Đang chat với: {selectedConv.username}</div>
              </div>

              <div ref={messagesContainerRef} className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc' }}>
                {loadingMessages && <div style={{ textAlign: 'center', color: '#64748b' }}>Đang nạp tin nhắn...</div>}
                
                {!loadingMessages && messages.map((msg, idx) => {
                  const isAdmin = msg.sender.includes('(Admin)');

                  return (
                    <div key={idx} className={`chat-bubble ${isAdmin ? 'admin' : 'user'}`} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', textAlign: isAdmin ? 'right' : 'left' }}>
                        {isAdmin ? 'Bạn (Admin)' : selectedConv.username}
                      </div>
                      <div className={`bubble-content ${isAdmin ? 'admin-bubble' : 'user-bubble'}`}>
                        {msg.type === 'ORDER_REFERENCE' && (
                          <div style={{ marginBottom: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 6, fontSize: 13, border: isAdmin ? '1px solid rgba(255,255,255,0.3)' : '1px solid #e2e8f0', color: isAdmin ? '#fff' : '#000' }}>
                            <strong>Tham chiếu đơn hàng:</strong> #{msg.orderId}
                          </div>
                        )}
                        {msg.content}
                        <div className="bubble-timestamp" style={{ opacity: 0.7, marginTop: 4 }}>
                          {new Date(parseInt(msg.timestamp)).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-input-area" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: '#fff', display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Nhập phản hồi cho ${selectedConv.username}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!connected}
                  style={{ flex: 1, padding: '12px 16px', fontSize: 14, borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
                <button
                  className="btn-primary"
                  onClick={sendMessage}
                  disabled={!connected || !inputMessage.trim()}
                  style={{ padding: '0 24px', borderRadius: 8, fontWeight: 600 }}
                >
                  Gửi
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
