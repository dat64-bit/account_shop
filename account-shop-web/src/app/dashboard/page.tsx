"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Portal from '@/components/Portal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';

interface Order {
  orderId: number;
  createdAt: string;
  productName: string;
  totalAmount: number;
  orderStatus: string;
  accountInfo?: string;
}

interface Ticket {
  ticketId: number;
  issueType: string;
  ticketStatusId: number;
  updatedAt: string;
}

// SVG Icons
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const ShoppingBag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);
const Clock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const Key = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.4Z"></path><path d="m15.5 7.5-3 3"></path><path d="m13.5 15 2 2"></path><path d="m5 20 2-2"></path><path d="M2 22 7 17"></path><path d="M9 13.5 12 10.5"></path><path d="M10.5 15 13.5 12"></path></svg>
);
const Copy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const Zap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const MessageSquare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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




export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Filters & Keyset Pagination States
  const [orderStatusFilter, setOrderStatusFilter] = useState<number | undefined>(undefined);
  const [orderKeyword, setOrderKeyword] = useState('');
  const [debouncedOrderKeyword, setDebouncedOrderKeyword] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOrderKeyword(orderKeyword);
    }, 1000);
    return () => clearTimeout(handler);
  }, [orderKeyword]);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<number | undefined>(undefined);

  const [ordersHasMore, setOrdersHasMore] = useState(false);
  const [ordersCursors, setOrdersCursors] = useState<(number | null)[]>([null]);
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);

  const [ticketsHasMore, setTicketsHasMore] = useState(false);
  const [ticketsCursors, setTicketsCursors] = useState<(number | null)[]>([null]);
  const [currentTicketsPage, setCurrentTicketsPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  const fetchOrders = async (lastId: number | null, page: number, currentStatusFilter = orderStatusFilter, currentKeyword = orderKeyword) => {
    try {
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
    }
  };

  const fetchTickets = async (lastId: number | null, page: number, currentStatusFilter = ticketStatusFilter) => {
    try {
      let url = `/user/tickets/my-tickets?limit=15`;
      if (lastId) url += `&lastId=${lastId}`;
      if (currentStatusFilter !== undefined) url += `&statusId=${currentStatusFilter}`;
      
      const res = await api.get(url);
      setTickets(res.data.content || []);
      setTicketsHasMore(res.data.hasMore || false);
      setCurrentTicketsPage(page);
    } catch (e) {
      console.error("Error fetching tickets:", e);
    }
  };

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

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user_info');
    if (!storedUserStr) {
      window.location.href = '/?error=login_required';
      return;
    }
    try {
      const storedUser = JSON.parse(storedUserStr);
      if (storedUser.role !== 'ROLE_CUSTOMER') {
        window.location.href = '/?error=unauthorized';
        return;
      }
      setChecking(false);
      setIsMounted(true);
    } catch {
      window.location.href = '/?error=login_required';
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      const initLoad = async () => {
        setLoading(true);
        setOrdersCursors([null]);
        setTicketsCursors([null]);
        await Promise.all([
          fetchOrders(null, 1, orderStatusFilter, debouncedOrderKeyword),
          fetchTickets(null, 1, ticketStatusFilter)
        ]);
        setLoading(false);
      };
      initLoad();
    }
  }, [isMounted, orderStatusFilter, debouncedOrderKeyword, ticketStatusFilter]);

  const [ticketMessage, setTicketMessage] = useState('');

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
      const response = await api.post('/user/tickets', {
        orderDetailId: selectedOrderId,
        issueType: 'ORDER_ISSUE',
        message: ticketMessage
      });

      setShowTicketModal(false);
      setTicketMessage('');
      setActiveTab('tickets');
      // Reset and refresh tickets
      setTicketsCursors([null]);
      await fetchTickets(null, 1);
      alert('Yêu cầu hỗ trợ đã được gửi thành công!');
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert('Gửi yêu cầu thất bại, vui lòng thử lại.');
    }
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg, #f8fafc)' }}>
        <div style={{ fontSize: 14, color: 'var(--text-sub, #64748b)' }}>Đang xác thực quyền truy cập...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="dashboard-page">
        <div className="container">
          <div className="dashboard-layout">
            
            {/* Sidebar điều hướng */}
            <aside className="dashboard-sidebar">
              <div className="user-profile-card">
                <div className="user-avatar">
                  <UserIcon />
                </div>
                <div className="user-info">
                  <span className="user-name">Văn Đạt</span>
                  <span className="user-email">vdat2@gmail.com</span>
                </div>
              </div>

              <nav className="dashboard-nav">
                <button 
                  className={activeTab === 'overview' ? 'active' : ''} 
                  onClick={() => setActiveTab('overview')}
                >
                  <ShoppingBag /> Tổng quan
                </button>
                <button 
                  className={activeTab === 'orders' ? 'active' : ''} 
                  onClick={() => setActiveTab('orders')}
                >
                  <Clock /> Lịch sử mua hàng
                </button>
                <button 
                  className={activeTab === 'profile' ? 'active' : ''} 
                  onClick={() => setActiveTab('profile')}
                >
                  <UserIcon /> Thông tin cá nhân
                </button>
                <button 
                  className={activeTab === 'tickets' ? 'active' : ''} 
                  onClick={() => setActiveTab('tickets')}
                >
                  <MessageSquare /> Hỗ trợ / Ticket
                </button>
              </nav>

              <div className="sidebar-balance">
                <span>Số dư tài khoản:</span>
                <strong className="balance-amount">500.000đ</strong>
                <button className="btn-deposit">Nạp tiền ngay</button>
              </div>
            </aside>

            {/* Nội dung chính */}
            <div className="dashboard-content">
              {/* TAB: TỔNG QUAN */}
              {activeTab === 'overview' && (
                <div className="animate-in dashboard-overview-container">
                  <div className="overview-stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: '#dcfce7', color: '#166534' }}><ShoppingBag /></div>
                      <div className="stat-info">
                        <span className="stat-label">Tổng đơn hàng</span>
                        <strong className="stat-value">{orders.length}</strong>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}><Clock /></div>
                      <div className="stat-info">
                        <span className="stat-label">Đã thanh toán</span>
                        <strong className="stat-value">{orders.filter(o => o.orderStatus === 'COMPLETED').length}</strong>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><Key /></div>
                      <div className="stat-info">
                        <span className="stat-label">Tổng chi tiêu</span>
                        <strong className="stat-value">{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}đ</strong>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-charts-grid">
                    {/* Phân tích chi tiêu */}
                    <div className="content-card chart-card">
                      <div className="card-header">
                        <h2 className="card-title">Phân tích chi tiêu</h2>
                      </div>
                      <div className="chart-content">
                        <div className="spending-item">
                          <div className="spending-info">
                            <span>Phim Ảnh</span>
                            <span>2 đơn</span>
                          </div>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: '70%', background: '#60a5fa' }}></div></div>
                        </div>
                        <div className="spending-item">
                          <div className="spending-info">
                            <span>Âm nhạc</span>
                            <span>1 đơn</span>
                          </div>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: '30%', background: '#f87171' }}></div></div>
                        </div>
                        <div className="spending-item">
                          <div className="spending-info">
                            <span>VPN & Bảo mật</span>
                            <span>0 đơn</span>
                          </div>
                          <div className="progress-bar"><div className="progress-fill" style={{ width: '0%', background: '#fbbf24' }}></div></div>
                        </div>
                      </div>
                    </div>

                    {/* Trạng thái tài khoản */}
                    <div className="content-card chart-card">
                      <div className="card-header">
                        <h2 className="card-title">Trạng thái tài khoản</h2>
                      </div>
                      <div className="chart-content account-status-summary">
                        <div className="status-circle-container">
                          <div className="status-circle-text">
                            <strong>100%</strong>
                            <span>An toàn</span>
                          </div>
                        </div>
                        <div className="status-legend">
                          <div className="legend-item"><span className="dot" style={{ background: '#10b981' }}></span> Hoạt động: <strong>2</strong></div>
                          <div className="legend-item"><span className="dot" style={{ background: '#f59e0b' }}></span> Sắp hết hạn: <strong>0</strong></div>
                          <div className="legend-item"><span className="dot" style={{ background: '#ef4444' }}></span> Đã khóa: <strong>0</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="content-card promo-card">
                    <div className="promo-content">
                      <Zap />
                      <div>
                        <h3>Nâng cấp lên VIP để nhận ưu đãi 10%</h3>
                        <p>Dành cho khách hàng có tổng chi tiêu trên 1.000.000đ</p>
                      </div>
                      <button className="btn-upgrade">Xem điều kiện</button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: LỊCH SỬ ĐƠN HÀNG */}
              {activeTab === 'orders' && (
                <div className="content-card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">Lịch sử giao dịch</h2>
                    <p className="card-subtitle">Quản lý các đơn hàng và tài khoản bạn đã mua</p>
                  </div>

                  {/* Bộ lọc động */}
                  <div style={{ display: 'flex', gap: '16px', padding: '20px 30px 10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <input
                        type="text"
                        placeholder="Tìm theo tên sản phẩm..."
                        className="form-input"
                        value={orderKeyword}
                        onChange={e => setOrderKeyword(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--card-bg, #fff)', color: 'var(--text, #0f172a)' }}
                      />
                    </div>
                    <div style={{ width: '180px' }}>
                      <select
                        className="form-input"
                        value={orderStatusFilter === undefined ? 'all' : orderStatusFilter}
                        onChange={e => {
                          const val = e.target.value;
                          setOrderStatusFilter(val === 'all' ? undefined : Number(val));
                        }}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--card-bg, #fff)', color: 'var(--text, #0f172a)' }}
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
                </div>
              )}

              {/* TAB: THÔNG TIN CÁ NHÂN */}
              {activeTab === 'profile' && (
                <div className="content-card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">Thông tin tài khoản</h2>
                    <p className="card-subtitle">Cập nhật thông tin cá nhân và mật khẩu</p>
                  </div>
                  <div style={{ padding: '30px' }}>
                    <div className="profile-form-grid">
                      <div className="form-group">
                        <label>Họ và tên</label>
                        <div className="input-wrapper">
                          <input type="text" defaultValue="Văn Đạt" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Địa chỉ Email</label>
                        <div className="input-wrapper">
                          <input type="email" defaultValue="vdat2@gmail.com" disabled />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Số điện thoại</label>
                        <div className="input-wrapper">
                          <input type="text" placeholder="Chưa cập nhật" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <div className="input-wrapper">
                          <input type="password" placeholder="Để trống nếu không đổi" />
                        </div>
                      </div>
                    </div>
                    <button className="btn-submit" style={{ marginTop: 20, width: 'fit-content', padding: '12px 30px' }}>
                      Cập nhật thông tin
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: HỖ TRỢ / TICKET */}
              {activeTab === 'tickets' && (
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

                  {/* Bộ lọc động */}
                  <div style={{ display: 'flex', gap: '16px', padding: '20px 30px 10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '180px' }}>
                      <select
                        className="form-input"
                        value={ticketStatusFilter === undefined ? 'all' : ticketStatusFilter}
                        onChange={e => {
                          const val = e.target.value;
                          setTicketStatusFilter(val === 'all' ? undefined : Number(val));
                        }}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)', background: 'var(--card-bg, #fff)', color: 'var(--text, #0f172a)' }}
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
                        {tickets.map(ticket => (
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
                </div>
              )}
            </div>

          </div>
        </div>

        {/* MODAL BÁO LỖI TICKET */}
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
      </main>
      <Footer />
    </>
  );
}
