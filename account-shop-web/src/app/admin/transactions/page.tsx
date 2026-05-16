"use client";

import { useState, useEffect } from 'react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const mockTransactions = [
    { transId: 'TRX9981', username: 'vdat2', amount: 500000, method: 'MB Bank', status: 'Thành công', createdAt: '2026-05-15T09:00:00Z' },
    { transId: 'TRX9982', username: 'customer_1', amount: 100000, method: 'Momo', status: 'Chờ duyệt', createdAt: '2026-05-15T15:20:00Z' },
  ];

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 500);
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <div className="admin-table-container animate-in">
      <div className="card-header border-b border-slate-100">
        <h2 className="card-title">Quản lý Giao dịch</h2>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Người dùng</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.transId}>
                <td>{tx.transId}</td>
                <td className="admin-text-bold">{tx.username}</td>
                <td className="admin-text-price">{tx.amount.toLocaleString()}đ</td>
                <td>{tx.method}</td>
                <td>
                  <span className={`admin-badge ${tx.status === 'Thành công' ? 'success' : 'warning'}`}>
                    {tx.status}
                  </span>
                </td>
                <td>{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="admin-actions-cell">
                  <div className="admin-table-actions">
                    {tx.status === 'Chờ duyệt' && <button className="btn-admin-action edit">Duyệt ngay</button>}
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
