"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/common/Portal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import api from '@/lib/axios';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Camera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);
const X = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  const [ticketStatusFilter, setTicketStatusFilter] = useState<number | undefined>(undefined);
  const [ticketsHasMore, setTicketsHasMore] = useState(false);
  const [ticketsCursors, setTicketsCursors] = useState<(number | null)[]>([null]);
  const [currentTicketsPage, setCurrentTicketsPage] = useState(1);

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [ticketMessage, setTicketMessage] = useState('');

  const fetchTickets = async (lastId: number | null, page: number, currentStatusFilter = ticketStatusFilter) => {
    try {
      setLoading(true);
      let url = `/user/tickets/my-tickets?limit=15`;
      if (lastId) url += `&lastId=${lastId}`;
      if (currentStatusFilter !== undefined) url += `&statusId=${currentStatusFilter}`;

      const res = await api.get(url);
      setTickets(res.data.content || []);
      setTicketsHasMore(res.data.hasMore || false);
      setCurrentTicketsPage(page);
    } catch (e) {
      console.error("Error fetching tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTicketsCursors([null]);
    fetchTickets(null, 1, ticketStatusFilter);

    // Fetch orders to populate select dropdown
    api.get('/user/orders/my-orders?limit=100').then(res => {
      setOrders(res.data.content || []);
    }).catch(() => {});
  }, [ticketStatusFilter]);

  const handleTicketsPrev = () => {
    if (currentTicketsPage > 1) {
      const prevPage = currentTicketsPage - 1;
      const prevLastId = ticketsCursors[prevPage - 1];
      fetchTickets(prevLastId, prevPage);
    }
  };

  const handleTicketsNext = () => {
    if (ticketsHasMore && tickets.length > 0) {
      const nextPage = currentTicketsPage + 1;
      const currentLastId = tickets[tickets.length - 1].ticketId;
      setTicketsCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchTickets(currentLastId, nextPage);
    }
  };

  const handleSubmitTicket = async () => {
    if (!selectedOrderId) {
      alert('Vui lòng chọn đơn hàng cần hỗ trợ!');
      return;
    }
    if (!ticketMessage.trim()) {
      alert('Vui lòng nhập mô tả chi tiết lỗi!');
      return;
    }

    try {
      await api.post('/user/tickets', {
        orderDetailId: selectedOrderId,
        issueType: 'ORDER_ISSUE',
        message: ticketMessage
      });

      setShowTicketModal(false);
      setTicketMessage('');
      setTicketsCursors([null]);
      await fetchTickets(null, 1);
      alert('Yêu cầu hỗ trợ đã được gửi thành công!');
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert('Gửi yêu cầu thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div className="content-card animate-in">
      <div className="card-header ticket-header-flex">
        <div>
          <h2 className="card-title">Hỗ trợ khách hàng</h2>
          <p className="card-subtitle">Gửi yêu cầu hỗ trợ nếu bạn gặp sự cố với tài khoản</p>
        </div>
        <button
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '10px 16px' }}
          onClick={() => { setSelectedOrderId(null); setShowTicketModal(true); }}
        >
          <Plus /> Gửi yêu cầu mới
        </button>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-select-wrapper">
          <select
            className="admin-filter-select"
            value={ticketStatusFilter === undefined ? 'all' : ticketStatusFilter}
            onChange={e => {
              const val = e.target.value;
              setTicketStatusFilter(val === 'all' ? undefined : Number(val));
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="1">Đang chờ</option>
            <option value="3">Đang xử lý</option>
            <option value="2">Đã xử lý</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Mã Ticket</th>
              <th>Chủ đề</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>Chưa có ticket nào.</td></tr>
            ) : tickets.map(ticket => (
              <tr key={ticket.ticketId}>
                <td><strong>#{ticket.ticketId}</strong></td>
                <td><div className="table-product-name">{ticket.issueType}</div></td>
                <td>
                  <span className={`status-badge ${ticket.ticketStatusId === 1 ? 'open' : ticket.ticketStatusId === 2 ? 'resolved' : 'pending'}`}>
                    {ticket.ticketStatusId === 1 ? 'Đang chờ' : ticket.ticketStatusId === 2 ? 'Đã xử lý' : 'Đang xử lý'}
                  </span>
                </td>
                <td><span className="table-date">{new Date(ticket.updatedAt).toLocaleDateString()}</span></td>
                <td>
                  <button className="btn-view-account">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentTicketsPage}
        hasMore={ticketsHasMore}
        onPrev={handleTicketsPrev}
        onNext={handleTicketsNext}
      />

      <div className="ticket-empty-state" style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--border)' }}>
        <p style={{ color: '#64748b', fontSize: 13 }}>Nếu bạn cần hỗ trợ gấp, vui lòng nhắn tin qua <strong>Zalo: 0123.456.789</strong></p>
      </div>

      {showTicketModal && (
        <Portal>
          <div className="modal-overlay">
            <div className="modal-container ticket-modal animate-in">
              <div className="modal-header">
                <h3>Gửi yêu cầu hỗ trợ</h3>
                <button className="btn-close" onClick={() => setShowTicketModal(false)}><X /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Chọn đơn hàng cần hỗ trợ <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="ticket-select"
                    value={selectedOrderId || ''}
                    onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                  >
                    <option value="">-- Chọn đơn hàng của bạn --</option>
                    {orders.filter(o => o.orderStatus === 'COMPLETED').map(o => (
                      <option key={o.orderId} value={o.orderId}>
                        Order #{o.orderId} - {o.productName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label>Mô tả chi tiết lỗi <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    className="ticket-textarea"
                    placeholder="Vui lòng mô tả vấn đề bạn đang gặp phải (VD: Tài khoản sai pass, Profile bị khóa...)"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Hình ảnh minh họa (Tối đa 2 ảnh)</label>
                  <div className="image-upload-grid">
                    <div className="upload-box">
                      <Camera />
                      <span>Chọn ảnh 1</span>
                    </div>
                    <div className="upload-box">
                      <Camera />
                      <span>Chọn ảnh 2</span>
                    </div>
                  </div>
                </div>
                <div className="ticket-modal-footer">
                  <button className="btn-cancel" onClick={() => setShowTicketModal(false)}>Hủy bỏ</button>
                  <button className="btn-submit-ticket" onClick={handleSubmitTicket}>
                    Gửi yêu cầu hỗ trợ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
