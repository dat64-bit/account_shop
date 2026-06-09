"use client";

import { useState, useEffect } from 'react';
import { AdminPagination } from '@/components/admin/AdminPagination';
import api from '@/lib/axios';

// SVG Icons
const ArrowDownRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 7 10 10"></path><path d="M17 7v10H7"></path></svg>
);
const ArrowUpRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"></path><path d="M7 7h10v10"></path></svg>
);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const [hasMore, setHasMore] = useState(false);
  const [cursors, setCursors] = useState<(number | null)[]>([null]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 1000);
    return () => clearTimeout(handler);
  }, [keyword]);

  const fetchTransactions = async (lastId: number | null, page: number, currentStatusFilter = statusFilter, currentKeyword = debouncedKeyword) => {
    try {
      setLoading(true);
      let url = `/user/transactions/my-transactions?limit=15`;
      if (lastId) url += `&lastId=${lastId}`;
      if (currentStatusFilter !== undefined) url += `&statusId=${currentStatusFilter}`;
      if (currentKeyword.trim()) url += `&keyword=${encodeURIComponent(currentKeyword.trim())}`;

      const res = await api.get(url);
      setTransactions(res.data.content || []);
      setHasMore(res.data.hasMore || false);
      setCurrentPage(page);
    } catch (e) {
      console.error("Error fetching transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCursors([null]);
    fetchTransactions(null, 1, statusFilter, debouncedKeyword);
  }, [statusFilter, debouncedKeyword]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchTransactions(prevLastId, prevPage);
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
      fetchTransactions(currentLastId, nextPage);
    }
  };

  return (
    <div className="content-card animate-in">
      <div className="card-header">
        <h2 className="card-title">Lịch sử giao dịch</h2>
        <p className="card-subtitle">Quản lý biến động số dư và thanh toán của bạn</p>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-filter-search-wrapper">
          <input
            type="text"
            placeholder="Tìm theo nội dung..."
            className="admin-filter-input"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <div className="admin-filter-select-wrapper">
          <select
            className="admin-filter-select"
            value={statusFilter === undefined ? 'all' : statusFilter}
            onChange={e => {
              const val = e.target.value;
              setStatusFilter(val === 'all' ? undefined : Number(val));
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="2">Thành công</option>
            <option value="1">Chờ xử lý</option>
            <option value="3">Thất bại</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Thời gian</th>
              <th>Loại GD</th>
              <th>Số tiền</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Đang tải dữ liệu...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>Chưa có giao dịch nào.</td></tr>
            ) : transactions.map(tx => (
              <tr key={tx.transactionId}>
                <td><strong>#{tx.transactionId}</strong></td>
                <td><span className="table-date">{new Date(tx.createdAt).toLocaleString()}</span></td>
                <td>
                  <div className="table-product-name">{tx.transactionTypeName || 'Khác'}</div>
                </td>
                <td>
                  <span className="table-amount" style={{ color: tx.amount > 0 ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {tx.amount > 0 ? <ArrowDownRight /> : <ArrowUpRight />}
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}đ
                  </span>
                </td>
                <td style={{ maxWidth: 250, whiteSpace: 'normal', fontSize: '13px', color: '#64748b' }}>
                  {tx.description}
                </td>
                <td>
                  <span className={`status-badge ${tx.transactionStatusId === 2 ? 'completed' : tx.transactionStatusId === 1 ? 'pending' : 'failed'}`}>
                    {tx.transactionStatusId === 2 ? 'Thành công' : tx.transactionStatusId === 1 ? 'Chờ xử lý' : 'Thất bại'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        hasMore={hasMore}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
