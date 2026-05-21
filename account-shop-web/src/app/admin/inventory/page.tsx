"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function AdminInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { toast, showToast } = useAdminToast();

  const fetchInventory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/api/admin/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInventory(await res.json());
      } else {
        if (res.status === 401 || res.status === 403) {
          showToast('Phiên đăng nhập hết hạn hoặc không có quyền truy cập.', 'error');
        } else {
          showToast(`Lỗi tải dữ liệu kho hàng (${res.status})`, 'error');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteInventory = async () => {
    if (pendingDeleteId === null) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/admin/inventory/${pendingDeleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Xóa tài khoản khỏi kho thành công.', 'success');
        fetchInventory();
      } else {
        showToast(`Không thể xóa tài khoản (${res.status})`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchInventory();
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <>
      <AdminTableCard
        title="Quản lý Kho hàng"
        headerAction={<button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}><Plus /> Nhập kho</button>}
      >
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
                    <button className="btn-admin-action delete" onClick={() => setPendingDeleteId(item.accountItemId)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableCard>

      <AdminConfirmModal
        open={pendingDeleteId !== null}
        variant="danger"
        title="Xác nhận xóa tài khoản?"
        description="Bạn có chắc chắn muốn xóa tài khoản này khỏi kho hàng không? Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        onConfirm={executeDeleteInventory}
        onCancel={() => setPendingDeleteId(null)}
      />

      <AdminToast toast={toast} />
    </>
  );
}
