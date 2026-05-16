"use client";

import { useState, useEffect } from 'react';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function AdminInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchInventory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/admin/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInventory(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInventory = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này khỏi kho?")) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/admin/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchInventory();
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <div className="admin-table-container animate-in">
      <div className="card-header border-b border-slate-100">
        <h2 className="card-title">Quản lý Kho hàng</h2>
        <button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}><Plus /> Nhập kho</button>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Email/Username</th>
              <th>Mật khẩu</th>
              <th>Trạng thái</th>
              <th>Ngày nhập</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.accountItemId}>
                <td>#{item.accountItemId}</td>
                <td className="admin-text-bold">{item.productName}</td>
                <td>{item.accountEmail}</td>
                <td><code>{item.accountPassword}</code></td>
                <td>
                  <span className={`admin-badge ${item.itemStatusId === 1 ? 'success' : item.itemStatusId === 2 ? 'warning' : 'info'}`}>
                    {item.statusName}
                  </span>
                </td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td className="admin-actions-cell">
                  <div className="admin-table-actions">
                    <button className="btn-admin-action delete" onClick={() => handleDeleteInventory(item.accountItemId)}>
                      Xóa
                    </button>
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
