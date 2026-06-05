"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

const ShoppingBag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);
const Clock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const Key = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.4Z"></path><path d="m15.5 7.5-3 3"></path><path d="m13.5 15 2 2"></path><path d="m5 20 2-2"></path><path d="M2 22 7 17"></path><path d="M9 13.5 12 10.5"></path><path d="M10.5 15 13.5 12"></path></svg>
);
const Zap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

export default function DashboardOverviewPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/user/orders/my-orders?limit=100');
        setOrders(res.data.content || []);
      } catch (e) {
        console.error("Error fetching orders:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="animate-in dashboard-overview-container">
      <div className="overview-stats-grid">
        <div className="stat-card">
          <div className="stat-icon green"><ShoppingBag /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng đơn hàng</span>
            <strong className="stat-value">{orders.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Clock /></div>
          <div className="stat-info">
            <span className="stat-label">Đã thanh toán</span>
            <strong className="stat-value">{orders.filter(o => o.orderStatus === 'COMPLETED').length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Key /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng chi tiêu</span>
            <strong className="stat-value">{orders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}đ</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-grid">
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
              <div className="progress-bar"><div className="progress-fill blue" style={{ width: '70%' }}></div></div>
            </div>
            <div className="spending-item">
              <div className="spending-info">
                <span>Âm nhạc</span>
                <span>1 đơn</span>
              </div>
              <div className="progress-bar"><div className="progress-fill red" style={{ width: '30%' }}></div></div>
            </div>
            <div className="spending-item">
              <div className="spending-info">
                <span>VPN & Bảo mật</span>
                <span>0 đơn</span>
              </div>
              <div className="progress-bar"><div className="progress-fill amber" style={{ width: '0%' }}></div></div>
            </div>
          </div>
        </div>

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
              <div className="legend-item"><span className="dot green"></span> Hoạt động: <strong>2</strong></div>
              <div className="legend-item"><span className="dot amber"></span> Sắp hết hạn: <strong>0</strong></div>
              <div className="legend-item"><span className="dot red"></span> Đã khóa: <strong>0</strong></div>
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
  );
}
