"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/common/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Replacements Modal
  const [replacementsModalOpen, setReplacementsModalOpen] = useState(false);
  const [replacementsLoading, setReplacementsLoading] = useState(false);
  const [replacements, setReplacements] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Refund Confirmation Modal
  const [refundConfirmOpen, setRefundConfirmOpen] = useState(false);
  const [orderToRefund, setOrderToRefund] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refunding, setRefunding] = useState(false);

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

  const handleOpenReplacements = async (order: any) => {
    setSelectedOrder(order);
    setReplacementsModalOpen(true);
    setReplacementsLoading(true);
    try {
      const res = await api.get(`/admin/orders/available-replacements?orderDetailId=${order.orderDetailId}`);
      setReplacements(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách tài khoản thay thế.', 'error');
    } finally {
      setReplacementsLoading(false);
    }
  };

  const handleConfirmReplace = async (rep: any) => {
    if (!selectedOrder) return;
    try {
      let url = `/admin/orders/${selectedOrder.orderDetailId}/replace-account?newAccountItemId=${rep.accountItemId}`;
      if (rep.accountSlotId) {
        url += `&newAccountSlotId=${rep.accountSlotId}`;
      }
      await api.post(url);
      showToast('Đổi tài khoản thành công.', 'success');
      setReplacementsModalOpen(false);
      fetchData(cursors[currentPage - 1], currentPage);
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data || 'Không thể đổi tài khoản.', 'error');
    }
  };

  const handleOpenRefund = (order: any) => {
    setOrderToRefund(order);
    setRefundAmount(order.totalAmount ? order.totalAmount.toString() : '');
    setRefundConfirmOpen(true);
  };

  const executeRefund = async () => {
    if (!orderToRefund) return;
    if (!refundAmount || isNaN(Number(refundAmount)) || Number(refundAmount) < 0) {
      showToast('Vui lòng nhập số tiền hoàn hợp lệ.', 'error');
      return;
    }
    setRefunding(true);
    try {
      await api.post(`/admin/orders/${orderToRefund.orderId}/refund?amount=${refundAmount}`);
      showToast('Hoàn tiền đơn hàng thành công.', 'success');
      setRefundConfirmOpen(false);
      setOrderToRefund(null);
      fetchData(cursors[currentPage - 1], currentPage);
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data || 'Không thể hoàn tiền đơn hàng.', 'error');
    } finally {
      setRefunding(false);
    }
  };

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
              placeholder="Tìm theo mã đơn, khách hàng hoặc tên sản phẩm..."
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
              <option value="6">Báo lỗi (Failed)</option>
              <option value="7">Đã đổi tài khoản (Replaced)</option>
              <option value="5">Hoàn tiền (Refunded)</option>
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
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td className="table-empty-cell" colSpan={8}>Không tìm thấy đơn hàng nào.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.orderId}>
                        <td>#{order.orderId}</td>
                        <td>
                          <div className="admin-cell-stacked">
                            <span className="admin-text-bold">{order.username || 'Không xác định'}</span>
                            {order.fullName && <span className="admin-text-muted">{order.fullName}</span>}
                          </div>
                        </td>
                        <td className="admin-text-bold">{order.productName || 'N/A'}</td>
                        <td className="table-truncate-cell" title={order.accountInfo}>
                          {order.accountInfo || <span className="text-slate-400 italic">Chưa giao hàng</span>}
                        </td>
                        <td className="admin-text-price">{order.totalAmount.toLocaleString()}đ</td>
                        <td>
                          <span className={`admin-badge ${order.orderStatus === 'COMPLETED' ? 'success' :
                            order.orderStatus === 'REFUNDED' ? 'secondary' :
                              order.orderStatus === 'FAILED' ? 'danger' :
                                order.orderStatus === 'REPLACED' ? 'info' : 'warning'
                            }`}>
                            {order.orderStatus === 'COMPLETED' ? 'Hoàn tất' :
                              order.orderStatus === 'REFUNDED' ? 'Đã hoàn tiền' :
                                order.orderStatus === 'FAILED' ? 'Báo lỗi' :
                                  order.orderStatus === 'REPLACED' ? 'Đã đổi tài khoản' : 'Chờ xử lý'}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="admin-actions-cell">
                          <div className="admin-table-actions">
                            <>
                              <button
                                className="btn-admin-action edit"
                                onClick={() => handleOpenReplacements(order)}
                              >
                                Đổi tài khoản
                              </button>
                              <button
                                className="btn-admin-action delete"
                                onClick={() => handleOpenRefund(order)}
                              >
                                Hoàn tiền
                              </button>
                            </>
                          </div>
                        </td>
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

      {replacementsModalOpen && (
        <Portal>
          <div className="modal-overlay" onClick={() => setReplacementsModalOpen(false)}>
            <div className="modal-container lg animate-in" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Đổi tài khoản cho đơn hàng #{selectedOrder?.orderId}</h3>
                <button className="btn-close" onClick={() => setReplacementsModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body">
                {replacementsLoading ? (
                  <div className="table-loading-cell">Đang tải danh sách tài khoản thay thế...</div>
                ) : replacements.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="admin-text-muted">Không có tài khoản/slot trống nào khả dụng cho sản phẩm này trong kho.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Tài khoản</th>
                          <th>Mật khẩu</th>
                          <th>Profile / PIN</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {replacements.map((rep, idx) => (
                          <tr key={idx}>
                            <td><strong>{rep.accountEmail}</strong></td>
                            <td><code>{rep.accountPassword}</code></td>
                            <td>
                              {rep.accountSlotId ? (
                                <span className="admin-badge info">
                                  {rep.slotName} {rep.pinCode ? `(PIN: ${rep.pinCode})` : ''}
                                </span>
                              ) : (
                                <span className="admin-badge secondary">
                                  Cả tài khoản
                                </span>
                              )}
                            </td>
                            <td>
                              <span className={`admin-badge ${rep.statusId === 1 ? 'success' :
                                rep.statusId === 2 ? 'warning' : 'danger'
                                }`}>
                                {rep.statusName}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-admin-action edit"
                                onClick={() => handleConfirmReplace(rep)}
                              >
                                Chọn
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      <AdminConfirmModal
        open={refundConfirmOpen}
        variant="danger"
        title="Xác nhận hoàn tiền đơn hàng?"
        description={
          <>
            <div className="admin-confirm-desc-text">
              Bạn có chắc chắn muốn hoàn tiền cho đơn hàng <strong>#{orderToRefund?.orderId}</strong> không?
              Thao tác này sẽ hoàn lại tiền vào ví của khách hàng và không thể hoàn tác.
            </div>
            <label className="admin-confirm-input-label">Số tiền hoàn lại (VND) <span className="required-asterisk">*</span></label>
            <input
              type="number"
              className="form-input"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              placeholder="Nhập số tiền hoàn..."
              min="0"
              required
            />
          </>
        }
        confirmLabel={refunding ? "Đang hoàn..." : "Xác nhận hoàn"}
        onConfirm={executeRefund}
        onCancel={() => setRefundConfirmOpen(false)}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
