"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filters & Keyset Pagination States
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
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
  const { toast, showToast } = useAdminToast();

  const fetchData = async (lastId: number | null, page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      let url = `${API_BASE_URL}/api/admin/orders?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (statusFilter !== undefined) url += `&statusId=${statusFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.content || []);
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
      } else {
        showToast('Lỗi khi tải danh sách đơn hàng.', 'error');
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (isMounted) {
      setCursors([null]);
      fetchData(null, 1);
    }
  }, [statusFilter, debouncedKeyword, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchData(prevLastId, prevPage);
    }
  };

  const handleNext = () => {
    if (hasMore && orders.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = orders[orders.length - 1].orderId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchData(currentLastId, nextPage);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <AdminTableCard title="Quản lý Đơn hàng">
        {/* Bộ lọc động */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Tìm theo tên khách hàng (username)..."
              className="form-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            />
          </div>
          <div style={{ width: '180px' }}>
            <select
              className="form-input"
              value={statusFilter === undefined ? 'all' : statusFilter.toString()}
              onChange={e => {
                const val = e.target.value;
                setStatusFilter(val === 'all' ? undefined : parseInt(val));
              }}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="2">Hoàn tất (Completed)</option>
              <option value="1">Chờ xử lý (Pending)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse" style={{ padding: '20px', textAlign: 'center' }}>Đang tải danh sách đơn hàng...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Thông tin tài khoản</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày mua</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy đơn hàng nào.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.orderId}>
                        <td>#{order.orderId}</td>
                        <td>{order.username || 'Không xác định'}</td>
                        <td className="admin-text-bold">{order.productName || 'N/A'}</td>
                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.accountInfo}>
                          {order.accountInfo || <span className="text-slate-400 italic">Chưa giao hàng</span>}
                        </td>
                        <td className="admin-text-price">{order.totalAmount.toLocaleString()}đ</td>
                        <td>
                          <span className={`admin-badge ${order.orderStatus === 'COMPLETED' ? 'success' : 'warning'}`}>
                            {order.orderStatus === 'COMPLETED' ? 'Hoàn tất' : 'Chờ xử lý'}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <AdminPagination
              currentPage={currentPage}
              hasMore={hasMore}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </>
        )}
      </AdminTableCard>

      <AdminToast toast={toast} />
    </div>
  );
}
