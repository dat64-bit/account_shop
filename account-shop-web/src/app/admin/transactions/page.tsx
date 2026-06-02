"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import api from '@/lib/axios';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filters & Keyset Pagination
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cursors, setCursors] = useState<(number | null)[]>([null]);
  const { toast, showToast } = useAdminToast();

  // ── Manual Credit Modal ──────────────────────────────────────
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditKeyword, setCreditKeyword] = useState('');
  const [creditUsers, setCreditUsers] = useState<any[]>([]);
  const [creditUsersLoading, setCreditUsersLoading] = useState(false);
  const [selectedCreditUser, setSelectedCreditUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [crediting, setCrediting] = useState(false);

  // ── Balance Lock Modal ───────────────────────────────────────
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockKeyword, setLockKeyword] = useState('');
  const [lockUsers, setLockUsers] = useState<any[]>([]);
  const [lockUsersLoading, setLockUsersLoading] = useState(false);
  const [locking, setLocking] = useState(false);

  // Debounce main search
  useEffect(() => {
    const h = setTimeout(() => setDebouncedKeyword(keyword), 1000);
    return () => clearTimeout(h);
  }, [keyword]);

  // Debounce credit user search
  useEffect(() => {
    if (!creditKeyword.trim()) { setCreditUsers([]); return; }
    const h = setTimeout(() => searchUsers(creditKeyword, setCreditUsers, setCreditUsersLoading), 500);
    return () => clearTimeout(h);
  }, [creditKeyword]);

  // Debounce lock user search
  useEffect(() => {
    if (!lockKeyword.trim()) { setLockUsers([]); return; }
    const h = setTimeout(() => searchUsers(lockKeyword, setLockUsers, setLockUsersLoading), 500);
    return () => clearTimeout(h);
  }, [lockKeyword]);

  const searchUsers = async (kw: string, setUsers: (u: any[]) => void, setLoading: (b: boolean) => void) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?keyword=${encodeURIComponent(kw)}&limit=10`);
      setUsers(res.data.content || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

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
    } catch {
      showToast('Lỗi kết nối máy chủ hoặc tải giao dịch.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (isMounted) { setCursors([null]); fetchData(null, 1); }
  }, [statusFilter, debouncedKeyword, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      fetchData(cursors[prevPage - 1], prevPage);
    }
  };
  const handleNext = () => {
    if (hasMore && transactions.length > 0) {
      const nextPage = currentPage + 1;
      const lastId = transactions[transactions.length - 1].transactionId;
      setCursors(prev => { const c = [...prev]; c[nextPage - 1] = lastId; return c; });
      fetchData(lastId, nextPage);
    }
  };

  // ── Manual Credit Submit ──────────────────────────────────────
  const handleCredit = async () => {
    if (!selectedCreditUser) { showToast('Vui lòng chọn tài khoản.', 'error'); return; }
    const amt = Number(creditAmount);
    if (!creditAmount || isNaN(amt) || amt <= 0) { showToast('Vui lòng nhập số tiền hợp lệ.', 'error'); return; }
    if (!creditNote.trim()) { showToast('Vui lòng nhập ghi chú.', 'error'); return; }
    setCrediting(true);
    try {
      await api.post(`/admin/accounts/${selectedCreditUser.accountId}/manual-credit?amount=${amt}&note=${encodeURIComponent(creditNote.trim())}`);
      showToast(`Đã cộng ${amt.toLocaleString()}đ vào ví ${selectedCreditUser.username}.`, 'success');
      setCreditModalOpen(false);
      setSelectedCreditUser(null);
      setCreditAmount('');
      setCreditNote('');
      setCreditKeyword('');
      fetchData(cursors[currentPage - 1], currentPage);
    } catch (err: any) {
      showToast(err.response?.data || 'Không thể cộng tiền.', 'error');
    } finally {
      setCrediting(false);
    }
  };

  // ── Balance Lock Toggle ───────────────────────────────────────
  const handleToggleLock = async (user: any, lock: boolean) => {
    setLocking(true);
    try {
      await api.put(`/admin/accounts/${user.accountId}/balance-lock?lock=${lock}`);
      showToast(lock ? `Đã khóa số dư của ${user.username}.` : `Đã mở khóa số dư của ${user.username}.`, 'success');
      // Refresh lock user list
      searchUsers(lockKeyword, setLockUsers, setLockUsersLoading);
    } catch (err: any) {
      showToast(err.response?.data || 'Không thể thực hiện.', 'error');
    } finally {
      setLocking(false);
    }
  };

  const getStatusBadgeClass = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'success': return 'success';
      case 'failed': return 'danger';
      default: return 'warning';
    }
  };
  const getStatusText = (statusName: string) => {
    switch (statusName?.toLowerCase()) {
      case 'success': return 'Thành công';
      case 'failed': return 'Thất bại';
      default: return 'Đang xử lý';
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="space-y-6">
        <AdminTableCard title="Quản lý Giao dịch">
          {/* Bộ lọc + Nút thao tác thủ công */}
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
            <div className="admin-table-actions">
              <button
                className="btn-admin-action edit"
                onClick={() => { setCreditModalOpen(true); setSelectedCreditUser(null); setCreditKeyword(''); setCreditAmount(''); setCreditNote(''); }}
              >
                + Cộng tiền
              </button>
              <button
                className="btn-admin-action delete"
                onClick={() => { setLockModalOpen(true); setLockKeyword(''); setLockUsers([]); }}
              >
                🔒 Khóa số dư
              </button>
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

      {/* ── Modal: Cộng tiền thủ công ────────────────────────────── */}
      {creditModalOpen && (
        <Portal>
          <div className="modal-overlay" onClick={() => setCreditModalOpen(false)}>
            <div className="modal-container animate-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Cộng tiền thủ công</h3>
                <button className="btn-close" onClick={() => setCreditModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                {/* Bước 1: Tìm user */}
                <div className="admin-modal-form-group">
                  <label className="admin-modal-label">Tìm tài khoản (username)</label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    placeholder="Nhập username để tìm kiếm..."
                    value={creditKeyword}
                    onChange={e => { setCreditKeyword(e.target.value); setSelectedCreditUser(null); }}
                  />
                  {creditUsersLoading && <div className="admin-text-muted" style={{marginTop: '6px'}}>Đang tìm...</div>}
                  {!creditUsersLoading && creditUsers.length > 0 && !selectedCreditUser && (
                    <div className="admin-modal-dropdown">
                      {creditUsers.filter(u => u.roleName !== 'ADMIN').map(u => (
                        <div
                          key={u.accountId}
                          className="admin-modal-dropdown-item"
                          onClick={() => { setSelectedCreditUser(u); setCreditKeyword(u.username); setCreditUsers([]); }}
                        >
                          <span className="admin-text-bold">{u.username}</span>
                          <span className="admin-text-muted"> — {u.fullName || 'Chưa có tên'} — Ví: {u.balance?.toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hiển thị user đã chọn */}
                {selectedCreditUser && (
                  <div className="admin-info-box admin-info-box-margin">
                    <div><span className="admin-text-muted">Tài khoản:</span> <span className="admin-text-bold">{selectedCreditUser.username}</span></div>
                    <div><span className="admin-text-muted">Tên:</span> {selectedCreditUser.fullName || '—'}</div>
                    <div><span className="admin-text-muted">Số dư hiện tại:</span> <span className="admin-text-price">{selectedCreditUser.balance?.toLocaleString()}đ</span></div>
                  </div>
                )}

                {/* Bước 2: Số tiền */}
                <div className="admin-modal-form-group">
                  <label className="admin-modal-label">Số tiền cộng (VNĐ)</label>
                  <input
                    type="number"
                    className="admin-modal-input"
                    placeholder="Ví dụ: 100000"
                    min="1000"
                    value={creditAmount}
                    onChange={e => setCreditAmount(e.target.value)}
                  />
                </div>

                {/* Bước 3: Ghi chú */}
                <div className="admin-modal-form-group">
                  <label className="admin-modal-label">Ghi chú (bắt buộc)</label>
                  <textarea
                    className="admin-modal-input"
                    rows={3}
                    placeholder="Lý do cộng tiền..."
                    value={creditNote}
                    onChange={e => setCreditNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-admin-secondary" onClick={() => setCreditModalOpen(false)}>Hủy</button>
                <button
                  className="btn-admin-primary"
                  onClick={handleCredit}
                  disabled={crediting || !selectedCreditUser || !creditAmount || !creditNote.trim()}
                >
                  {crediting ? 'Đang xử lý...' : `Cộng ${creditAmount ? Number(creditAmount).toLocaleString() : '0'}đ`}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Modal: Khóa / Mở khóa số dư ─────────────────────────── */}
      {lockModalOpen && (
        <Portal>
          <div className="modal-overlay" onClick={() => setLockModalOpen(false)}>
            <div className="modal-container animate-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Khóa / Mở khóa số dư</h3>
                <button className="btn-close" onClick={() => setLockModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="admin-modal-form-group">
                  <label className="admin-modal-label">Tìm tài khoản (username)</label>
                  <input
                    type="text"
                    className="admin-modal-input"
                    placeholder="Nhập username để tìm kiếm..."
                    value={lockKeyword}
                    onChange={e => setLockKeyword(e.target.value)}
                  />
                </div>
                {lockUsersLoading && <div className="admin-text-muted">Đang tìm...</div>}
                {!lockUsersLoading && lockUsers.length > 0 && (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Tên</th>
                          <th>Số dư</th>
                          <th>Trạng thái khoá</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lockUsers.filter(u => u.roleName !== 'ADMIN').map(u => (
                          <tr key={u.accountId}>
                            <td className="admin-text-bold">{u.username}</td>
                            <td>{u.fullName || '—'}</td>
                            <td className="admin-text-price">{u.balance?.toLocaleString()}đ</td>
                            <td>
                              <span className={`admin-badge ${u.balanceLocked ? 'danger' : 'success'}`}>
                                {u.balanceLocked ? '🔒 Đang khóa' : '✅ Bình thường'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-table-actions">
                                {u.balanceLocked ? (
                                  <button
                                    className="btn-admin-action edit"
                                    disabled={locking}
                                    onClick={() => handleToggleLock(u, false)}
                                  >
                                    Mở khóa
                                  </button>
                                ) : (
                                  <button
                                    className="btn-admin-action delete"
                                    disabled={locking}
                                    onClick={() => handleToggleLock(u, true)}
                                  >
                                    Khóa
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-admin-secondary" onClick={() => setLockModalOpen(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
