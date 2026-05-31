"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';

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
      let url = `/admin/orders?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (statusFilter !== undefined) url += `&statusId=${statusFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await api.get(url);
      setOrders(res.data.content || []);
      setHasMore(res.data.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast('Lỗi kết nối máy chủ hoặc tải đơn hàng.', 'error');
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
        <div className="admin-filter-bar">
          <div className="admin-filter-search-wrapper">
            <input
              type="text"
              placeholder="Tìm theo mã đơn, username khách hàng hoặc tên sản phẩm..."
              className="admin-filter-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="admin-filter-select-wrapper">
            <select
              className="admin-filter-select"
              value={statusFilter === undefined ? 'all' : statusFilter.toString()}
              onChange={e => {
                const val = e.target.value;
                setStatusFilter(val === 'all' ? undefined : parseInt(val));
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="2">Hoàn tất (Completed)</option>
              <option value="1">Chờ xử lý (Pending)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="table-loading-cell">Đang tải danh sách đơn hàng...</div>
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
                      <td className="table-empty-cell" colSpan={7}>Không tìm thấy đơn hàng nào.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.orderId}>
                        <td>#{order.orderId}</td>
                        <td>{order.username || 'Không xác định'}</td>
                        <td className="admin-text-bold">{order.productName || 'N/A'}</td>
                        <td className="table-truncate-cell" title={order.accountInfo}>
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
