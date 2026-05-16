"use client";

import { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Mẫu dữ liệu vì backend chưa có API Admin Orders
  const mockOrders = [
    { orderId: 1001, username: 'customer1', productName: 'Netflix Premium', totalAmount: 50000, status: 'Hoàn tất', createdAt: '2026-05-15T10:00:00Z' },
    { orderId: 1002, username: 'user_vdat', productName: 'Spotify 1 Year', totalAmount: 120000, status: 'Đang xử lý', createdAt: '2026-05-15T11:30:00Z' },
  ];

  useEffect(() => {
    setIsMounted(true);
    // Giả lập fetch
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <div className="admin-table-container animate-in">
      <div className="card-header border-b border-slate-100">
        <h2 className="card-title">Quản lý Đơn hàng</h2>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày mua</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.orderId}>
                <td>#{order.orderId}</td>
                <td>{order.username}</td>
                <td className="admin-text-bold">{order.productName}</td>
                <td className="admin-text-price">{order.totalAmount.toLocaleString()}đ</td>
                <td>
                  <span className={`admin-badge ${order.status === 'Hoàn tất' ? 'success' : 'warning'}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td className="admin-actions-cell">
                  <div className="admin-table-actions">
                    <button className="btn-admin-action view">Chi tiết</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
