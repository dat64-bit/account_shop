"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/common/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import api from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeysetPagination } from '@/hooks/useKeysetPagination';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filters & Keyset Pagination
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 1000);
  const { showToast } = useAdminToast();

  // ── Manual Credit Modal ──────────────────────────────────────
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [creditKeyword, setCreditKeyword] = useState('');
  const debouncedCreditKeyword = useDebounce(creditKeyword, 500);
  const [creditUsers, setCreditUsers] = useState<any[]>([]);
  const [creditUsersLoading, setCreditUsersLoading] = useState(false);
  const [selectedCreditUser, setSelectedCreditUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [crediting, setCrediting] = useState(false);

  // ── Balance Lock Modal ───────────────────────────────────────
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lockKeyword, setLockKeyword] = useState('');
  const debouncedLockKeyword = useDebounce(lockKeyword, 500);
  const [lockUsers, setLockUsers] = useState<any[]>([]);
  const [lockUsersLoading, setLockUsersLoading] = useState(false);
  const [locking, setLocking] = useState(false);

  // Fetch credit user search
  useEffect(() => {
    if (!debouncedCreditKeyword.trim()) { setCreditUsers([]); return; }
    searchUsers(debouncedCreditKeyword, setCreditUsers, setCreditUsersLoading);
  }, [debouncedCreditKeyword]);

  // Fetch lock user search
  useEffect(() => {
    if (!debouncedLockKeyword.trim()) { setLockUsers([]); return; }
    searchUsers(debouncedLockKeyword, setLockUsers, setLockUsersLoading);
  }, [debouncedLockKeyword]);

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

  const {
    currentPage,
    setCurrentPage,
    hasMore,
    setHasMore,
    cursors,
    handlePrev,
    handleNext,
    resetPagination
  } = useKeysetPagination(fetchData, (tx: any) => tx.transactionId);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (isMounted) { resetPagination(); fetchData(null, 1); }
  }, [statusFilter, debouncedKeyword, isMounted]);

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

  const transactionColumns: Column[] = [
    { title: 'Mã GD', dataIndex: 'transactionId', render: (id: number) => `#${id}` },
    { title: 'Người dùng', dataIndex: 'username', render: (val: string) => <span className="admin-text-bold">{val || 'UNKNOWN'}</span> },
    { title: 'Số tiền', dataIndex: 'amount', render: (val: number) => <span className="admin-text-price">{val?.toLocaleString()}đ</span> },
    { title: 'Loại GD', dataIndex: 'transactionTypeName', render: (val: string) => val || 'N/A' },
    { title: 'Phương thức', dataIndex: 'paymentMethodName', render: (val: string) => val || 'N/A' },
    {
      title: 'Mô tả', dataIndex: 'description', render: (val: string) => (
        <div className="table-truncate-cell" title={val}>
          {val || '-'}
        </div>
      )
    },
    {
      title: 'Trạng thái', dataIndex: 'transactionStatusName', render: (status: string) => (
        <span className={`admin-badge ${getStatusBadgeClass(status)}`}>
          {getStatusText(status)}
        </span>
      )
    },
    { title: 'Thời gian', dataIndex: 'createdAt', render: (date: string) => new Date(date).toLocaleString() }
  ];

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
              <AdminTable 
                columns={transactionColumns} 
                data={transactions} 
                rowKey="transactionId" 
                emptyText="Không tìm thấy giao dịch nào." 
              />
              <AdminPagination
                currentPage={currentPage}
                hasMore={hasMore}
                onPrev={handlePrev}
                onNext={() => handleNext(transactions)}
              />
            </>
          )}
        </AdminTableCard>
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
