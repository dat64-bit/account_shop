"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeysetPagination } from '@/hooks/useKeysetPagination';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { showToast } = useAdminToast();
  const [pendingUser, setPendingUser] = useState<any>(null);

  // Filters & Keyset Pagination
  const [statusIdFilter, setStatusIdFilter] = useState<number | undefined>(undefined);
  const [roleIdFilter, setRoleIdFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 1000);

  const fetchUsers = async (lastId: number | null, page: number) => {
    setLoading(true);
    try {
      let url = `/admin/users?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (statusIdFilter !== undefined) url += `&statusId=${statusIdFilter}`;
      if (roleIdFilter !== undefined) url += `&roleId=${roleIdFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await api.get(url);
      setUsers(res.data.content || []);
      setHasMore(res.data.hasMore || false);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        showToast('Phiên đăng nhập hết hạn hoặc không có quyền truy cập.', 'error');
      } else {
        showToast('Lỗi tải dữ liệu người dùng hoặc kết nối máy chủ.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const {
    currentPage,
    setCurrentPage,
    hasMore,
    setHasMore,
    cursors,
    handlePrev,
    handleNext,
    resetPagination
  } = useKeysetPagination(fetchUsers, (user: any) => user.accountId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch when filters change
  useEffect(() => {
    if (isMounted) {
      resetPagination();
      fetchUsers(null, 1);
    }
  }, [statusIdFilter, roleIdFilter, debouncedKeyword, isMounted]);

  const handleToggleUserStatus = (user: any) => {
    setPendingUser(user);
  };

  const executeToggleStatus = async () => {
    if (!pendingUser) return;

    if (pendingUser.roleName?.toUpperCase() === 'ADMIN' || pendingUser.roleName?.toUpperCase() === 'ROLE_ADMIN') {
      showToast('Không thể thay đổi trạng thái của Quản trị viên.', 'error');
      setPendingUser(null);
      return;
    }

    const isLocking = pendingUser.accountStatusId === 1;
    const newStatus = isLocking ? 2 : 1;
    const actionText = isLocking ? 'khóa' : 'mở khóa';

    try {
      await api.put(`/admin/users/${pendingUser.accountId}/status?statusId=${newStatus}`);
      showToast(`Đã ${actionText} tài khoản ${pendingUser.username} thành công.`, 'success');
      fetchUsers(cursors[currentPage - 1], currentPage);
    } catch (error) {
      console.error("Error updating user status:", error);
      showToast(`Có lỗi xảy ra khi ${actionText} tài khoản.`, 'error');
    } finally {
      setPendingUser(null);
    }
  };

  const userColumns: Column[] = [
    { title: 'ID', dataIndex: 'accountId', render: (id: number) => `#${id}` },
    { title: 'Tên đăng nhập', dataIndex: 'username', render: (val: string) => <span className="admin-text-bold">{val}</span> },
    { title: 'Vai trò', dataIndex: 'roleName' },
    { title: 'Họ tên', dataIndex: 'fullName' },
    { title: 'Số dư', dataIndex: 'balance', render: (val: number) => <span className="admin-text-price">{val?.toLocaleString()}đ</span> },
    {
      title: 'Trạng thái', dataIndex: 'accountStatusId', render: (statusId: number) => (
        <span className={`admin-badge ${statusId === 1 ? 'success' : 'danger'}`}>
          {statusId === 1 ? 'Hoạt động' : 'Đã khóa'}
        </span>
      )
    },
    {
      title: 'Thao tác', dataIndex: 'actions', render: (_: any, user: any) => (
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
      )
    }
  ];

  if (!isMounted) return null;

  return (
    <>
      <AdminTableCard title="Quản lý người dùng">
        {/* Bộ lọc động */}
        <div className="admin-filter-bar with-border">
          <div className="admin-filter-search-wrapper">
            <input
              type="text"
              placeholder="Tìm theo username hoặc email..."
              className="admin-filter-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="admin-filter-select-wrapper">
            <select
              className="admin-filter-select"
              value={roleIdFilter === undefined ? 'all' : roleIdFilter}
              onChange={e => {
                const val = e.target.value;
                setRoleIdFilter(val === 'all' ? undefined : Number(val));
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="1">Khách hàng</option>
              <option value="2">Quản trị viên</option>
            </select>
          </div>
          <div className="admin-filter-select-wrapper">
            <select
              className="admin-filter-select"
              value={statusIdFilter === undefined ? 'all' : statusIdFilter}
              onChange={e => {
                const val = e.target.value;
                setStatusIdFilter(val === 'all' ? undefined : Number(val));
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="2">Đã khóa</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="table-loading-cell">Đang tải danh sách người dùng...</div>
        ) : (
          <>
            <AdminTable 
              columns={userColumns} 
              data={users} 
              rowKey="accountId" 
              emptyText="Không tìm thấy người dùng nào." 
            />
            <AdminPagination
              currentPage={currentPage}
              hasMore={hasMore}
              onPrev={handlePrev}
              onNext={() => handleNext(users)}
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
    </>
  );
}
