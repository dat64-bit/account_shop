"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/common/Portal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import api from '@/lib/axios';

// SVG Icons
const Key = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.4Z"></path><path d="m15.5 7.5-3 3"></path><path d="m13.5 15 2 2"></path><path d="m5 20 2-2"></path><path d="M2 22 7 17"></path><path d="M9 13.5 12 10.5"></path><path d="M10.5 15 13.5 12"></path></svg>
);
const Copy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const LifeBuoy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
);
const Camera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);
const X = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [ticketMessage, setTicketMessage] = useState('');

  const [orderStatusFilter, setOrderStatusFilter] = useState<number | undefined>(undefined);
  const [orderKeyword, setOrderKeyword] = useState('');
  const [debouncedOrderKeyword, setDebouncedOrderKeyword] = useState('');

  const [ordersHasMore, setOrdersHasMore] = useState(false);
  const [ordersCursors, setOrdersCursors] = useState<(number | null)[]>([null]);
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOrderKeyword(orderKeyword);
    }, 1000);
    return () => clearTimeout(handler);
  }, [orderKeyword]);

  const fetchOrders = async (lastId: number | null, page: number, currentStatusFilter = orderStatusFilter, currentKeyword = debouncedOrderKeyword) => {
    try {
      setLoading(true);
      let url = `/user/orders/my-orders?limit=15`;
      if (lastId) url += `&lastId=${lastId}`;
      if (currentStatusFilter !== undefined) url += `&statusId=${currentStatusFilter}`;
      if (currentKeyword.trim()) url += `&keyword=${encodeURIComponent(currentKeyword.trim())}`;

      const res = await api.get(url);
      setOrders(res.data.content || []);
      setOrdersHasMore(res.data.hasMore || false);
      setCurrentOrdersPage(page);
    } catch (e) {
      console.error("Error fetching orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOrdersCursors([null]);
    fetchOrders(null, 1, orderStatusFilter, debouncedOrderKeyword);
  }, [orderStatusFilter, debouncedOrderKeyword]);

  const handleOrdersPrev = () => {
    if (currentOrdersPage > 1) {
      const prevPage = currentOrdersPage - 1;
      const prevLastId = ordersCursors[prevPage - 1];
      fetchOrders(prevLastId, prevPage);
    }
  };

  const handleOrdersNext = () => {
    if (ordersHasMore && orders.length > 0) {
      const nextPage = currentOrdersPage + 1;
      const currentLastId = orders[orders.length - 1].orderId;
      setOrdersCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchOrders(currentLastId, nextPage);
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
      alert('Yêu cầu hỗ trợ đã được gửi thành công!');
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert('Gửi yêu cầu thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div className="content-card animate-in">
      <div className="card-header">
        <h2 className="card-title">Lịch sử giao dịch</h2>
        <p className="card-subtitle">Quản lý các đơn hàng và tài khoản bạn đã mua</p>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-search-wrapper">
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            className="admin-filter-input"
            value={orderKeyword}
            onChange={e => setOrderKeyword(e.target.value)}
          />
        </div>
        <div className="admin-filter-select-wrapper">
          <select
            className="admin-filter-select"
            value={orderStatusFilter === undefined ? 'all' : orderStatusFilter}
            onChange={e => {
              const val = e.target.value;
              setOrderStatusFilter(val === 'all' ? undefined : Number(val));
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="2">Hoàn thành</option>
            <option value="1">Chờ xử lý</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Sản phẩm</th>
              <th>Ngày mua</th>
              <th>Giá tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Không tìm thấy đơn hàng nào.</td></tr>
            ) : orders.map(order => (
              <tr key={order.orderId}>
                <td><strong>#{order.orderId}</strong></td>
                <td>
                  <div className="table-product-name">{order.productName || 'Đang cập nhật'}</div>
                </td>
                <td><span className="table-date">{new Date(order.createdAt).toLocaleString()}</span></td>
                <td><span className="table-amount">{order.totalAmount.toLocaleString()}đ</span></td>
                <td>
                  <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus === 'COMPLETED' ? 'Hoàn thành' : 'Chờ xử lý'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {order.orderStatus === 'COMPLETED' ? (
                      <>
                        <button className="btn-view-account" onClick={() => alert(`Tài khoản: ${order.accountInfo}`)}>
                          <Key /> Lấy code
                        </button>
                        <button className="btn-report-issue" onClick={() => { setSelectedOrderId(order.orderId); setShowTicketModal(true); }}>
                          <LifeBuoy /> Báo lỗi
                        </button>
                      </>
                    ) : (
                      <button className="btn-pay-now">Thanh toán</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentOrdersPage}
        hasMore={ordersHasMore}
        onPrev={handleOrdersPrev}
        onNext={handleOrdersNext}
      />

      <div className="purchased-accounts-section">
        <h3 className="section-small-title">Tài khoản đã mua gần đây</h3>
        <div className="account-cards-grid">
          {orders.filter(o => o.accountInfo).map(o => (
            <div key={o.orderId} className="account-item-card">
              <div className="account-card-head">
                <strong>{o.productName}</strong>
                <span className="account-id">#{o.orderId}</span>
              </div>
              <div className="account-card-body">
                <div className="account-field">
                  <span className="label">Thông tin đăng nhập:</span>
                  <div className="value-box">
                    <code>{o.accountInfo}</code>
                    <button className="btn-copy" title="Sao chép" onClick={() => { navigator.clipboard.writeText(o.accountInfo || ''); alert('Đã sao chép!'); }}><Copy /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTicketModal && (
        <Portal>
          <div className="modal-overlay">
            <div className="modal-container ticket-modal animate-in">
              <div className="modal-header">
                <h3>{selectedOrderId ? `Báo lỗi đơn hàng #${selectedOrderId}` : 'Gửi yêu cầu hỗ trợ'}</h3>
                <button className="btn-close" onClick={() => setShowTicketModal(false)}><X /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Chọn đơn hàng cần hỗ trợ <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="ticket-select"
                    value={selectedOrderId || ''}
                    onChange={(e) => setSelectedOrderId(Number(e.target.value))}
                    disabled={!!selectedOrderId && orders.some(o => o.orderId === selectedOrderId)}
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
