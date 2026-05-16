"use client";

import { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:8080/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 2 : 1;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/status?statusId=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchUsers();
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <div className="admin-table-container animate-in">
      <div className="card-header border-b border-slate-100">
        <h2 className="card-title">Quản lý người dùng</h2>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Số dư</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.accountId}>
                <td>#{user.accountId}</td>
                <td className="admin-text-bold">{user.username}</td>
                <td>{user.fullName}</td>
                <td className="admin-text-price">{user.balance?.toLocaleString()}đ</td>
                <td>
                  <span className={`admin-badge ${user.accountStatusId === 1 ? 'success' : 'danger'}`}>
                    {user.accountStatusId === 1 ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="admin-actions-cell">
                  <div className="admin-table-actions">
                    <button className="btn-admin-action view">Sửa</button>
                    <button
                      className={`btn-admin-action ${user.accountStatusId === 1 ? 'lock' : 'edit'}`}
                      onClick={() => handleToggleUserStatus(user.accountId, user.accountStatusId)}
                    >
                      {user.accountStatusId === 1 ? 'Khóa' : 'Mở'}
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
