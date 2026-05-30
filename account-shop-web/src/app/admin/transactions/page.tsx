"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';

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
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      let url = `${API_BASE_URL}/api/admin/transactions?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (statusFilter !== undefined) url += `&statusId=${statusFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.content || []);
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
      } else {
        showToast('Lỗi khi tải danh sách giao dịch.', 'error');
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
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
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Tìm theo tên người dùng (username)..."
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
              <option value="2">Thành công (Success)</option>
              <option value="1">Đang xử lý (Pending)</option>
              <option value="3">Thất bại (Failed)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse" style={{ padding: '20px', textAlign: 'center' }}>Đang tải danh sách giao dịch...</div>
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
                      <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy giao dịch nào.</td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.transactionId}>
                        <td>#{tx.transactionId}</td>
                        <td className="admin-text-bold">{tx.username || 'UNKNOWN'}</td>
                        <td className="admin-text-price">{tx.amount.toLocaleString()}đ</td>
                        <td>{tx.transactionTypeName || 'N/A'}</td>
                        <td>{tx.paymentMethodName || 'N/A'}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={tx.description}>
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
