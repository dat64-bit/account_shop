"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast, showToast } = useAdminToast();

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/admin/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      } else {
        if (res.status === 401 || res.status === 403) {
          showToast('Phiên đăng nhập hết hạn hoặc không có quyền truy cập.', 'error');
        } else {
          showToast(`Lỗi tải danh sách ticket (${res.status})`, 'error');
        }
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketReplies = async (ticketId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/v1/tickets/${ticketId}/replies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTicketReplies(data);
      } else {
        showToast(`Lỗi tải nội dung phản hồi (${res.status})`, 'error');
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
      showToast('Lỗi kết nối máy chủ khi tải phản hồi.', 'error');
    }
  };

  const handleOpenTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    fetchTicketReplies(ticket.ticketId);
  };

  const handleSendReply = async () => {
    if (!adminReply.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/v1/tickets/${selectedTicket.ticketId}/replies`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: adminReply })
      });
      if (res.ok) {
        setAdminReply('');
        fetchTicketReplies(selectedTicket.ticketId);
        showToast('Gửi phản hồi thành công.', 'success');
      } else {
        showToast(`Không thể gửi phản hồi (${res.status})`, 'error');
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      showToast('Lỗi kết nối khi gửi phản hồi.', 'error');
    }
  };

  const handleResolveTicket = async (newStatus: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/admin/tickets/${selectedTicket.ticketId}/status?statusId=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTickets();
        setSelectedTicket(null);
        showToast('Cập nhật trạng thái ticket thành công.', 'success');
      } else {
        showToast(`Không thể cập nhật trạng thái (${res.status})`, 'error');
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
      showToast('Lỗi kết nối.', 'error');
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchTickets();
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <>
      <div className="space-y-6">
        <AdminTableCard title="Danh sách Ticket hỗ trợ">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Người dùng</th>
                <th>Chủ đề</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.ticketId}>
                  <td>#{t.ticketId}</td>
                  <td>{t.username || 'Khách'}</td>
                  <td><strong>{t.issueType}</strong></td>
                  <td>
                    <span className={`admin-badge ${t.ticketStatusId === 1 ? 'danger' : t.ticketStatusId === 2 ? 'success' : 'warning'}`}>
                      {t.ticketStatusId === 1 ? 'Chờ xử lý' : t.ticketStatusId === 2 ? 'Đã xong' : 'Đang xử lý'}
                    </span>
                  </td>
                  <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="admin-actions-cell">
                    <div className="admin-table-actions">
                      <button className="btn-admin-action edit" onClick={() => handleOpenTicket(t)}>Xử lý ngay</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableCard>

        {/* Giao diện Chat/Xử lý Ticket */}
        {selectedTicket && (
          <div className="content-card animate-in">
            <div className="card-header">
              <h2 className="card-title">Xử lý Ticket #{selectedTicket.ticketId}</h2>
              <button className="btn-close" onClick={() => setSelectedTicket(null)}>&times;</button>
            </div>
            <div className="admin-chat-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', height: 400 }}>
              <div className="chat-messages" style={{ overflowY: 'auto', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                {ticketReplies.map((reply, idx) => (
                  <div key={idx} className={`chat-bubble ${reply.isAdmin ? 'admin' : 'user'}`} style={{ marginBottom: 12, display: 'flex', flexDirection: reply.isAdmin ? 'row-reverse' : 'row' }}>
                    <div className="bubble-content" style={{
                      background: reply.isAdmin ? '#2563eb' : '#fff',
                      color: reply.isAdmin ? '#fff' : '#1e293b',
                      padding: '8px 12px',
                      borderRadius: 12,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      maxWidth: '70%'
                    }}>
                      {reply.message}
                      <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{new Date(reply.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                {ticketReplies.length === 0 && <div className="text-center text-muted py-10">Chưa có phản hồi nào.</div>}
              </div>

              <div className="chat-input-area" style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập nội dung phản hồi..."
                  value={adminReply}
                  onChange={e => setAdminReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                />
                <button className="btn-primary" onClick={handleSendReply}>Gửi</button>
              </div>

              <div className="admin-actions" style={{ marginTop: 20, display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <button className="btn-view-account" style={{ background: '#10b981', color: '#fff' }} onClick={() => handleResolveTicket(2)}>Xong (Hoàn tất)</button>
                <button className="btn-view-account" style={{ background: '#f59e0b', color: '#fff' }} onClick={() => handleResolveTicket(3)}>Đang xử lý</button>
                <button className="btn-view-account" style={{ color: '#ef4444' }} onClick={() => setSelectedTicket(null)}>Đóng hội thoại</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminToast toast={toast} />
    </>
  );
}
