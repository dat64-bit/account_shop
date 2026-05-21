"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast, showToast } = useAdminToast();
  const [pendingUser, setPendingUser] = useState<any>(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        if (res.status === 401 || res.status === 403) {
          showToast('Phiên đăng nhập hết hạn hoặc không có quyền truy cập.', 'error');
        } else {
          showToast(`Lỗi tải dữ liệu người dùng (${res.status})`, 'error');
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
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
      <AdminTableCard title="Quản lý người dùng">
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
      </AdminTableCard>

      <AdminConfirmModal
        open={!!pendingUser}
        variant={pendingUser?.accountStatusId === 1 ? 'warning' : 'info'}
        title={pendingUser?.accountStatusId === 1 ? 'Xác nhận khóa tài khoản?' : 'Xác nhận mở khóa tài khoản?'}
        description={
          pendingUser?.accountStatusId === 1
            ? <>Bạn có chắc chắn muốn khóa tài khoản <strong>{pendingUser?.username}</strong> không? Người dùng này sẽ không thể đăng nhập cho đến khi được mở khóa.</>
            : <>Bạn có chắc chắn muốn mở khóa tài khoản <strong>{pendingUser?.username}</strong>? Người dùng sẽ có thể đăng nhập và mua sắm bình thường.</>
        }
        confirmLabel={pendingUser?.accountStatusId === 1 ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
        onConfirm={executeToggleStatus}
        onCancel={() => setPendingUser(null)}
      />

      <AdminToast toast={toast} />
    </>
  );
}
