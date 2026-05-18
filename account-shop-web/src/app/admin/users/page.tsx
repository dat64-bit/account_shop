"use client";

import { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleUserStatus = (user: any) => {
    setPendingUser(user);
  };

  const executeToggleStatus = async () => {
    if (!pendingUser) return;

    if (pendingUser.roleName?.toUpperCase() === 'ADMIN') {
      showToast('Không thể thay đổi trạng thái của Quản trị viên.', 'error');
      setPendingUser(null);
      return;
    }

    const token = localStorage.getItem('token');
    const isLocking = pendingUser.accountStatusId === 1;
    const newStatus = isLocking ? 2 : 1;
    const actionText = isLocking ? 'khóa' : 'mở khóa';

    try {
      const res = await fetch(`http://localhost:8080/api/admin/users/${pendingUser.accountId}/status?statusId=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`Đã ${actionText} tài khoản ${pendingUser.username} thành công.`, 'success');
        fetchUsers();
      } else {
        showToast(`Có lỗi xảy ra khi ${actionText} tài khoản.`, 'error');
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      showToast('Có lỗi hệ thống', 'error');
    } finally {
      setPendingUser(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchUsers();
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <>
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
                      {user.roleName?.toUpperCase() === 'ADMIN' ? (
                        <span className="text-sm text-slate-400 font-medium italic px-2">Quản trị viên</span>
                      ) : (
                        <button
                          className={`btn-admin-action ${user.accountStatusId === 1 ? 'lock' : 'edit'}`}
                          onClick={() => handleToggleUserStatus(user)}
                        >
                          {user.accountStatusId === 1 ? 'Khóa' : 'Mở'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-confirm-modal animate-in zoom-in duration-300">
            <div className={`confirm-icon-wrapper ${pendingUser.accountStatusId === 1 ? 'warning' : 'info'}`}>
              {pendingUser.accountStatusId === 1 ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              )}
            </div>
            <h3 className="confirm-title">
              {pendingUser.accountStatusId === 1 ? 'Xác nhận khóa tài khoản?' : 'Xác nhận mở khóa tài khoản?'}
            </h3>
            <p className="confirm-desc">
              {pendingUser.accountStatusId === 1
                ? <>Bạn có chắc chắn muốn khóa tài khoản <strong>{pendingUser.username}</strong> không? Người dùng này sẽ không thể đăng nhập cho đến khi được mở khóa.</>
                : <>Bạn có chắc chắn muốn mở khóa tài khoản <strong>{pendingUser.username}</strong>? Người dùng sẽ có thể đăng nhập và mua sắm bình thường.</>}
            </p>
            <div className="confirm-actions">
              <button
                className="btn-confirm-cancel"
                onClick={() => setPendingUser(null)}
              >
                Hủy bỏ
              </button>
              <button
                className={`btn-confirm-action ${pendingUser.accountStatusId === 1 ? 'danger' : ''}`}
                onClick={executeToggleStatus}
              >
                {pendingUser.accountStatusId === 1 ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="admin-toast-container animate-in slide-in-from-right duration-300">
          <div className={`admin-toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              )}
            </div>
            <div className="toast-content">
              <h5>{toast.type === 'success' ? 'Thành công' : 'Thất bại'}</h5>
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
