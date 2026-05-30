"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast, showToast } = useAdminToast();
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Filters & Keyset Pagination
  const [statusIdFilter, setStatusIdFilter] = useState<number | undefined>(undefined);
  const [roleIdFilter, setRoleIdFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 1000);
    return () => clearTimeout(handler);
  }, [keyword]);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cursors, setCursors] = useState<(number | null)[]>([null]);

  const fetchUsers = async (lastId: number | null, page: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/admin/users?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (statusIdFilter !== undefined) url += `&statusId=${statusIdFilter}`;
      if (roleIdFilter !== undefined) url += `&roleId=${roleIdFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.content || []);
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch when filters change
  useEffect(() => {
    if (isMounted) {
      setCursors([null]);
      fetchUsers(null, 1);
    }
  }, [statusIdFilter, roleIdFilter, debouncedKeyword, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchUsers(prevLastId, prevPage);
    }
  };

  const handleNext = () => {
    if (hasMore && users.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = users[users.length - 1].accountId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchUsers(currentLastId, nextPage);
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
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${pendingUser.accountId}/status?statusId=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`Đã ${actionText} tài khoản ${pendingUser.username} thành công.`, 'success');
        fetchUsers(cursors[currentPage - 1], currentPage);
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

  if (!isMounted) return null;

  return (
    <>
      <AdminTableCard title="Quản lý người dùng">
        {/* Bộ lọc động */}
        <div style={{ display: 'flex', gap: '16px', padding: '20px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Tìm theo username hoặc email..."
              className="form-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <select
              className="form-input"
              value={roleIdFilter === undefined ? 'all' : roleIdFilter}
              onChange={e => {
                const val = e.target.value;
                setRoleIdFilter(val === 'all' ? undefined : Number(val));
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="1">Khách hàng</option>
              <option value="2">Quản trị viên</option>
            </select>
          </div>
          <div style={{ width: '180px' }}>
            <select
              className="form-input"
              value={statusIdFilter === undefined ? 'all' : statusIdFilter}
              onChange={e => {
                const val = e.target.value;
                setStatusIdFilter(val === 'all' ? undefined : Number(val));
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="2">Đã khóa</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse" style={{ padding: '20px', textAlign: 'center' }}>Đang tải danh sách người dùng...</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Vai trò</th>
                  <th>Họ tên</th>
                  <th>Số dư</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy người dùng nào.</td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.accountId}>
                      <td>#{user.accountId}</td>
                      <td className="admin-text-bold">{user.username}</td>
                      <td>{user.roleName}</td>
                      <td>{user.fullName}</td>
                      <td className="admin-text-price">{user.balance?.toLocaleString()}đ</td>
                      <td>
                        <span className={`admin-badge ${user.accountStatusId === 1 ? 'success' : 'danger'}`}>
                          {user.accountStatusId === 1 ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <div className="admin-table-actions">
                          {user.roleName?.toUpperCase() === 'ROLE_ADMIN' || user.roleName?.toUpperCase() === 'ADMIN' ? (
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
                  ))
                )}
              </tbody>
            </table>
            <AdminPagination
              currentPage={currentPage}
              hasMore={hasMore}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        )}
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
