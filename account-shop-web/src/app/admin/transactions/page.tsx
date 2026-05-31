"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
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
      let url = `/admin/transactions?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (statusFilter !== undefined) url += `&statusId=${statusFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await api.get(url);
      setTransactions(res.data.content || []);
      setHasMore(res.data.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      showToast('Lỗi kết nối máy chủ hoặc tải giao dịch.', 'error');
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
    if (hasMore && transactions.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = transactions[transactions.length - 1].transactionId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchData(currentLastId, nextPage);
    }
  };

  if (!isMounted) return null;

  const getStatusBadgeClass = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'success':
        return 'success';
      case 'failed':
        return 'danger';
      case 'pending':
      default:
        return 'warning';
    }
  };

  const getStatusText = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'success':
        return 'Thành công';
      case 'failed':
        return 'Thất bại';
      case 'pending':
      default:
        return 'Đang xử lý';
    }
  };

  return (
    <div className="space-y-6">
      <AdminTableCard title="Quản lý Giao dịch">
        {/* Bộ lọc động */}
        <div className="admin-filter-bar">
          <div className="admin-filter-search-wrapper">
            <input
              type="text"
              placeholder="Tìm theo tên người dùng (username)..."
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
              <option value="2">Thành công (Success)</option>
              <option value="1">Đang xử lý (Pending)</option>
              <option value="3">Thất bại (Failed)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="table-loading-cell">Đang tải danh sách giao dịch...</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã GD</th>
                    <th>Người dùng</th>
                    <th>Số tiền</th>
                    <th>Loại GD</th>
                    <th>Phương thức</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td className="table-empty-cell" colSpan={8}>Không tìm thấy giao dịch nào.</td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.transactionId}>
                        <td>#{tx.transactionId}</td>
                        <td className="admin-text-bold">{tx.username || 'UNKNOWN'}</td>
                        <td className="admin-text-price">{tx.amount.toLocaleString()}đ</td>
                        <td>{tx.transactionTypeName || 'N/A'}</td>
                        <td>{tx.paymentMethodName || 'N/A'}</td>
                        <td className="table-truncate-cell" title={tx.description}>
                          {tx.description || '-'}
                        </td>
                        <td>
                          <span className={`admin-badge ${getStatusBadgeClass(tx.transactionStatusName)}`}>
                            {getStatusText(tx.transactionStatusName)}
                          </span>
                        </td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
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
