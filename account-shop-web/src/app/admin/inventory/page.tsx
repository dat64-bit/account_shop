"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { AdminPagination } from '@/components/admin/AdminPagination';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function AdminInventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { toast, showToast } = useAdminToast();

  // Filters & Keyset Pagination
  const [productIdFilter, setProductIdFilter] = useState<number | undefined>(undefined);
  const [itemStatusIdFilter, setItemStatusIdFilter] = useState<number | undefined>(undefined);
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

  const fetchProductsList = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/admin/products?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.content || []);
      }
    } catch (err) {
      console.error("Error fetching products list for filter:", err);
    }
  };

  const fetchInventory = async (lastId: number | null, page: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let url = `http://localhost:8080/api/admin/inventory?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (productIdFilter !== undefined) url += `&productId=${productIdFilter}`;
      if (itemStatusIdFilter !== undefined) url += `&itemStatusId=${itemStatusIdFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data.content || []);
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
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
        fetchInventory(cursors[currentPage - 1], currentPage);
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
    fetchProductsList();
  }, []);

  // Fetch when filters change
  useEffect(() => {
    if (isMounted) {
      setCursors([null]);
      fetchInventory(null, 1);
    }
  }, [productIdFilter, itemStatusIdFilter, debouncedKeyword, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchInventory(prevLastId, prevPage);
    }
  };

  const handleNext = () => {
    if (hasMore && inventory.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = inventory[inventory.length - 1].accountItemId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchInventory(currentLastId, nextPage);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <AdminTableCard
        title="Quản lý Kho hàng"
        headerAction={<button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}><Plus /> Nhập kho</button>}
      >
        {/* Bộ lọc động */}
        <div style={{ display: 'flex', gap: '16px', padding: '20px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Tìm theo email hoặc username tài khoản..."
              className="form-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div style={{ width: '220px' }}>
            <select
              className="form-input"
              value={productIdFilter === undefined ? 'all' : productIdFilter}
              onChange={e => {
                const val = e.target.value;
                setProductIdFilter(val === 'all' ? undefined : Number(val));
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            >
              <option value="all">Tất cả sản phẩm</option>
              {products.map(p => (
                <option key={p.productId} value={p.productId}>{p.productName}</option>
              ))}
            </select>
          </div>
          <div style={{ width: '180px' }}>
            <select
              className="form-input"
              value={itemStatusIdFilter === undefined ? 'all' : itemStatusIdFilter}
              onChange={e => {
                const val = e.target.value;
                setItemStatusIdFilter(val === 'all' ? undefined : Number(val));
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Sẵn sàng</option>
              <option value="2">Đã bán</option>
              <option value="3">Lỗi</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse" style={{ padding: '20px', textAlign: 'center' }}>Đang tải danh sách kho...</div>
        ) : (
          <>
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
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Không có tài khoản nào trong kho hàng.</td>
                  </tr>
                ) : (
                  inventory.map(item => (
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
