"use client";

import { useState, useEffect } from 'react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import Portal from '@/components/common/Portal';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';

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
  
  // Slots State (Merged with Import Modal)
  const [slots, setSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Add Slot Form State
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [addSlotForm, setAddSlotForm] = useState({
    slotName: '',
    pinCode: '0000'
  });
  const [addingSlot, setAddingSlot] = useState(false);

  // Inline Slot Editing State
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [slotEditForm, setSlotEditForm] = useState({
    slotName: '',
    pinCode: '',
    slotStatusId: 1
  });
  const [pendingDeleteSlotId, setPendingDeleteSlotId] = useState<number | null>(null);

  // Import & Edit Inventory State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [importForm, setImportForm] = useState({
    productId: '',
    emailOrUsername: '',
    password: '',
    maxSlots: '',
    itemStatusId: '1'
  });

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
    try {
      const res = await api.get('/admin/products?limit=1000');
      setProducts(res.data.content || []);
    } catch (err) {
      console.error("Error fetching products list for filter:", err);
    }
  };

  const fetchInventory = async (lastId: number | null, page: number) => {
    setLoading(true);
    try {
      let url = `/admin/inventory?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (productIdFilter !== undefined) url += `&productId=${productIdFilter}`;
      if (itemStatusIdFilter !== undefined) url += `&itemStatusId=${itemStatusIdFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const res = await api.get(url);
      setInventory(res.data.content || []);
      setHasMore(res.data.hasMore || false);
      setCurrentPage(page);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        showToast('Phiên đăng nhập hết hạn hoặc không có quyền truy cập.', 'error');
      } else {
        showToast('Lỗi kết nối máy chủ hoặc tải dữ liệu kho hàng.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const executeDeleteInventory = async () => {
    if (pendingDeleteId === null) return;
    try {
      await api.delete(`/admin/inventory/${pendingDeleteId}`);
      showToast('Xóa tài khoản khỏi kho thành công.', 'success');
      fetchInventory(cursors[currentPage - 1], currentPage);
    } catch (err) {
      console.error(err);
      showToast('Không thể xóa tài khoản hoặc lỗi kết nối.', 'error');
    } finally {
      setPendingDeleteId(null);
    }
  };

  const fetchSlots = async (itemId: number) => {
    setSlotsLoading(true);
    try {
      const res = await api.get(`/admin/inventory/${itemId}/slots`);
      setSlots(res.data || []);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải danh sách slot.', 'error');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleOpenSlotsModal = (item: any) => {
    setEditingItem(item);
    setImportForm({
      productId: item.productId ? item.productId.toString() : '',
      emailOrUsername: item.accountEmail || '',
      password: item.accountPassword || '',
      maxSlots: '',
      itemStatusId: item.itemStatusId ? item.itemStatusId.toString() : '1'
    });
    setIsImportModalOpen(true);
    setShowAddSlotForm(false);
    setAddSlotForm({
      slotName: `Profile ${(item.totalSlots || 0) + 1}`,
      pinCode: '0000'
    });
    fetchSlots(item.accountItemId);
  };

  const handleAddSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!addSlotForm.slotName.trim()) {
      showToast('Vui lòng nhập tên Slot.', 'error');
      return;
    }
    setAddingSlot(true);
    try {
      const url = `/admin/inventory/${editingItem.accountItemId}/slots?slotName=${encodeURIComponent(addSlotForm.slotName.trim())}&pinCode=${encodeURIComponent(addSlotForm.pinCode.trim())}`;
      await api.post(url);
      showToast('Thêm Slot thành công.', 'success');
      const currentItemId = editingItem.accountItemId;
      await fetchSlots(currentItemId);
      await fetchInventory(cursors[currentPage - 1], currentPage);
      
      setAddSlotForm({
        slotName: `Profile ${slots.length + 2}`,
        pinCode: '0000'
      });
      setShowAddSlotForm(false);
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data || 'Không thể thêm Slot.', 'error');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleStartEditSlot = (slot: any) => {
    setEditingSlotId(slot.accountSlotId);
    setSlotEditForm({
      slotName: slot.slotName || '',
      pinCode: slot.pinCode || '',
      slotStatusId: slot.slotStatusId || 1
    });
  };

  const handleCancelEditSlot = () => {
    setEditingSlotId(null);
  };

  const handleSaveSlot = async (slotId: number) => {
    if (!slotEditForm.slotName.trim()) {
      showToast('Tên Slot không được để trống.', 'error');
      return;
    }
    try {
      const url = `/admin/inventory/slots/${slotId}?slotName=${encodeURIComponent(slotEditForm.slotName.trim())}&pinCode=${encodeURIComponent(slotEditForm.pinCode.trim())}&slotStatusId=${slotEditForm.slotStatusId}`;
      await api.put(url);
      showToast('Cập nhật slot thành công.', 'success');
      setEditingSlotId(null);
      if (editingItem) {
        await fetchSlots(editingItem.accountItemId);
        await fetchInventory(cursors[currentPage - 1], currentPage);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể cập nhật slot.', 'error');
    }
  };

  const handleDeleteSlotClick = (slotId: number) => {
    setPendingDeleteSlotId(slotId);
  };

  const executeDeleteSlot = async () => {
    if (pendingDeleteSlotId === null) return;
    try {
      await api.delete(`/admin/inventory/slots/${pendingDeleteSlotId}`);
      showToast('Xóa slot thành công.', 'success');
      if (editingItem) {
        await fetchSlots(editingItem.accountItemId);
        await fetchInventory(cursors[currentPage - 1], currentPage);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể xóa slot.', 'error');
    } finally {
      setPendingDeleteSlotId(null);
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

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importForm.productId || !importForm.emailOrUsername || !importForm.password) {
      showToast('Vui lòng nhập đầy đủ các thông tin bắt buộc.', 'error');
      return;
    }

    setSubmitting(true);
    const isEdit = editingItem !== null;
    const url = isEdit 
      ? `/admin/inventory/${editingItem.accountItemId}` 
      : `/admin/inventory`;
    const method = isEdit ? 'put' : 'post';

    const body = isEdit 
      ? {
          productId: Number(importForm.productId),
          emailOrUsername: importForm.emailOrUsername.trim(),
          password: importForm.password.trim(),
          itemStatusId: Number(importForm.itemStatusId)
        }
      : {
          productId: Number(importForm.productId),
          emailOrUsername: importForm.emailOrUsername.trim(),
          password: importForm.password.trim(),
          maxSlots: importForm.maxSlots ? Number(importForm.maxSlots) : null
        };

    try {
      await api[method](url, body);
      showToast(isEdit ? 'Cập nhật tài khoản thành công.' : 'Nhập kho tài khoản thành công.', 'success');
      setIsImportModalOpen(false);
      setEditingItem(null);
      fetchInventory(null, 1);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data || (isEdit ? 'Có lỗi xảy ra khi cập nhật tài khoản.' : 'Có lỗi xảy ra khi nhập kho.');
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMounted) return null;

  const selectedProduct = products.find(p => p.productId?.toString() === importForm.productId);

  return (
    <>
      <AdminTableCard
        title="Quản lý Kho hàng"
        headerAction={
          <button 
            className="btn-primary sm" 
            onClick={() => {
              setEditingItem(null);
              setImportForm({
                productId: products[0]?.productId ? products[0].productId.toString() : '',
                emailOrUsername: '',
                password: '',
                maxSlots: '',
                itemStatusId: '1'
              });
              setIsImportModalOpen(true);
            }}
          >
            <Plus /> Nhập kho
          </button>
        }
      >
        {/* Bộ lọc động */}
        <div className="admin-filter-bar with-border">
          <div className="admin-filter-search-wrapper">
            <input
              type="text"
              placeholder="Tìm theo email hoặc username tài khoản..."
              className="admin-filter-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="admin-filter-select-wrapper w-220">
            <select
              className="admin-filter-select"
              value={productIdFilter === undefined ? 'all' : productIdFilter}
              onChange={e => {
                const val = e.target.value;
                setProductIdFilter(val === 'all' ? undefined : Number(val));
              }}
            >
              <option value="all">Tất cả sản phẩm</option>
              {products.map(p => (
                <option key={p.productId} value={p.productId}>{p.productName}</option>
              ))}
            </select>
          </div>
          <div className="admin-filter-select-wrapper">
            <select
              className="admin-filter-select"
              value={itemStatusIdFilter === undefined ? 'all' : itemStatusIdFilter}
              onChange={e => {
                const val = e.target.value;
                setItemStatusIdFilter(val === 'all' ? undefined : Number(val));
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="1">Sẵn sàng</option>
              <option value="2">Đã bán</option>
              <option value="3">Lỗi</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="table-loading-cell">Đang tải danh sách kho...</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sản phẩm</th>
                  <th>Email/Username</th>
                  <th>Mật khẩu</th>
                  <th>Slot (Đã bán / Trống)</th>
                  <th>Trạng thái</th>
                  <th>Ngày nhập</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr>
                    <td className="table-empty-cell" colSpan={8}>Không có tài khoản nào trong kho hàng.</td>
                  </tr>
                ) : (
                  inventory.map(item => (
                    <tr key={item.accountItemId}>
                      <td>#{item.accountItemId}</td>
                      <td className="admin-text-bold">{item.productName}</td>
                      <td>{item.accountEmail}</td>
                      <td><code>{item.accountPassword}</code></td>
                      <td>
                        {item.totalSlots !== null && item.totalSlots !== undefined ? (
                          <span>
                            {item.soldSlots} / {item.freeSlots} (Tổng: {item.totalSlots})
                          </span>
                        ) : (
                          <span className="admin-text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        <span className={`admin-badge ${item.itemStatusId === 1 ? 'success' : item.itemStatusId === 2 ? 'warning' : 'info'}`}>
                          {item.statusName}
                        </span>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="admin-actions-cell">
                        <div className="admin-table-actions">
                          <button 
                            className="btn-admin-action edit" 
                            onClick={() => handleOpenSlotsModal(item)}
                          >
                            Sửa
                          </button>
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

      {isImportModalOpen && (
        <Portal>
          <div className="modal-overlay" onClick={() => {
            setIsImportModalOpen(false);
            setEditingItem(null);
          }}>
            <div className={`modal-container animate-in ${editingItem ? 'lg' : ''}`} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingItem ? 'Chi tiết tài khoản & Slot' : 'Nhập kho tài khoản'}</h3>
                <button className="btn-close" onClick={() => {
                  setIsImportModalOpen(false);
                  setEditingItem(null);
                }}>&times;</button>
              </div>
              <div className="modal-body">
                {/* Form General Info (Header) */}
                <form onSubmit={handleImportSubmit}>
                  <div className="admin-modal-form-grid">
                    <div className="form-group">
                      <label>Sản phẩm <span className="required-asterisk">*</span></label>
                      <select 
                        className="form-input" 
                        value={importForm.productId} 
                        onChange={e => setImportForm({ ...importForm, productId: e.target.value })} 
                        required
                      >
                        <option value="" disabled>-- Chọn sản phẩm --</option>
                        {products.map(p => (
                          <option key={p.productId} value={p.productId}>{p.productName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Email/Tên đăng nhập <span className="required-asterisk">*</span></label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={importForm.emailOrUsername} 
                        onChange={e => setImportForm({ ...importForm, emailOrUsername: e.target.value })} 
                        placeholder="VD: user@example.com hoặc username"
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Mật khẩu <span className="required-asterisk">*</span></label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={importForm.password} 
                        onChange={e => setImportForm({ ...importForm, password: e.target.value })} 
                        placeholder="Nhập mật khẩu tài khoản"
                        required 
                      />
                    </div>

                    {!editingItem ? (
                      <div className="form-group">
                        <label>Số lượng Slot (Dành cho tài khoản dùng chung)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={importForm.maxSlots} 
                          onChange={e => setImportForm({ ...importForm, maxSlots: e.target.value })} 
                          placeholder="Bỏ trống hoặc nhập 1 nếu là tài khoản riêng tư"
                          min="1"
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Trạng thái tài khoản <span className="required-asterisk">*</span></label>
                        <select
                          className="form-input"
                          value={importForm.itemStatusId}
                          onChange={e => setImportForm({ ...importForm, itemStatusId: e.target.value })}
                          required
                        >
                          <option value="1">Sẵn sàng</option>
                          <option value="2">Đã bán</option>
                          <option value="3">Lỗi</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Hiển thị Trạng thái Sản phẩm/Danh mục */}
                  {selectedProduct && (
                    <div className="admin-catalog-info-box admin-info-box-margin">
                      <div className="admin-catalog-info-row">
                        <span className="admin-catalog-info-label">Trạng thái sản phẩm:</span>
                        <span className={`admin-catalog-info-value ${
                          selectedProduct.productStatusId === 1 ? 'status-active' : selectedProduct.productStatusId === 2 ? 'status-inactive' : 'status-warning'
                        }`}>
                          {selectedProduct.productStatusId === 1 ? 'Đang bán' : selectedProduct.productStatusId === 2 ? 'Ngừng bán' : 'Hết hàng'}
                        </span>
                      </div>
                      <div className="admin-catalog-info-row">
                        <span className="admin-catalog-info-label">Danh mục ({selectedProduct.categoryName}):</span>
                        <span className={`admin-catalog-info-value ${
                          selectedProduct.categoryActive ? 'status-active' : 'status-inactive'
                        }`}>
                          {selectedProduct.categoryActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn-view-account" 
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setEditingItem(null);
                      }}
                      disabled={submitting}
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Đang xử lý...' : 'Lưu lại'}
                    </button>
                  </div>
                </form>

                {/* Form Detail - Các thông tin riêng (Slots) */}
                {editingItem && (
                  <>
                    <div className="admin-modal-divider"></div>
                    <div className="admin-modal-detail-header">
                      <h4 className="admin-modal-detail-title">Danh sách Slot (Detail)</h4>
                      {editingItem.totalSlots !== null && editingItem.totalSlots !== undefined && !showAddSlotForm && (
                        <button 
                          type="button"
                          className="btn-primary sm" 
                          onClick={() => setShowAddSlotForm(true)}
                        >
                          Thêm Slot
                        </button>
                      )}
                    </div>

                    {editingItem.totalSlots === null || editingItem.totalSlots === undefined ? (
                      <div className="admin-catalog-info-box">
                        <span className="admin-text-muted">Tài khoản này là tài khoản riêng tư (Mua trọn gói), không chia Slot.</span>
                      </div>
                    ) : (
                      <>
                        {/* Form thêm slot mới */}
                        {showAddSlotForm && (
                          <form onSubmit={handleAddSlotSubmit} className="admin-catalog-info-box admin-info-box-margin">
                            <div className="admin-modal-form-grid admin-modal-form-grid-margin">
                              <div className="form-group">
                                <label>Tên Slot / Profile <span className="required-asterisk">*</span></label>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  value={addSlotForm.slotName} 
                                  onChange={e => setAddSlotForm({ ...addSlotForm, slotName: e.target.value })} 
                                  required 
                                />
                              </div>
                              <div className="form-group">
                                <label>PIN Code (4 chữ số)</label>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  value={addSlotForm.pinCode} 
                                  onChange={e => setAddSlotForm({ ...addSlotForm, pinCode: e.target.value })} 
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            <div className="admin-table-actions">
                              <button 
                                type="submit" 
                                className="btn-admin-action edit"
                                disabled={addingSlot}
                              >
                                {addingSlot ? 'Đang thêm...' : 'Lưu'}
                              </button>
                              <button 
                                type="button" 
                                className="btn-admin-action delete"
                                onClick={() => setShowAddSlotForm(false)}
                              >
                                Hủy
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Danh sách slot */}
                        <div className="table-responsive">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Tên Slot (Profile)</th>
                                <th>PIN Code</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {slotsLoading ? (
                                <tr>
                                  <td className="table-empty-cell" colSpan={5}>Đang tải danh sách slots...</td>
                                </tr>
                              ) : slots.length === 0 ? (
                                <tr>
                                  <td className="table-empty-cell" colSpan={5}>Không có slot nào.</td>
                                </tr>
                              ) : (
                                slots.map(slot => (
                                  <tr key={slot.accountSlotId}>
                                    <td>#{slot.accountSlotId}</td>
                                    {editingSlotId === slot.accountSlotId ? (
                                      <>
                                        <td>
                                          <input 
                                            type="text" 
                                            className="form-input" 
                                            value={slotEditForm.slotName} 
                                            onChange={e => setSlotEditForm({ ...slotEditForm, slotName: e.target.value })} 
                                            required 
                                          />
                                        </td>
                                        <td>
                                          <input 
                                            type="text" 
                                            className="form-input" 
                                            value={slotEditForm.pinCode} 
                                            onChange={e => setSlotEditForm({ ...slotEditForm, pinCode: e.target.value })} 
                                            maxLength={4} 
                                          />
                                        </td>
                                        <td>
                                          <select
                                            className="form-input"
                                            value={slotEditForm.slotStatusId.toString()}
                                            onChange={e => setSlotEditForm({ ...slotEditForm, slotStatusId: parseInt(e.target.value) })}
                                          >
                                            <option value="1">Sẵn sàng</option>
                                            <option value="2">Đã bán</option>
                                            <option value="3">Lỗi</option>
                                          </select>
                                        </td>
                                        <td className="admin-actions-cell">
                                          <div className="admin-table-actions">
                                            <button 
                                              className="btn-admin-action edit" 
                                              onClick={() => handleSaveSlot(slot.accountSlotId)}
                                            >
                                              Lưu
                                            </button>
                                            <button 
                                              className="btn-admin-action delete" 
                                              onClick={handleCancelEditSlot}
                                            >
                                              Hủy
                                            </button>
                                          </div>
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td className="admin-text-bold">{slot.slotName}</td>
                                        <td><code>{slot.pinCode || 'N/A'}</code></td>
                                        <td>
                                          <span className={`admin-badge ${
                                            slot.slotStatusId === 1 ? 'success' : 
                                            slot.slotStatusId === 2 ? 'warning' : 'danger'
                                          }`}>
                                            {slot.slotStatusId === 1 ? 'Sẵn sàng' : 
                                             slot.slotStatusId === 2 ? 'Đang sử dụng' : 'Lỗi'}
                                          </span>
                                        </td>
                                        <td className="admin-actions-cell">
                                          <div className="admin-table-actions">
                                            <button 
                                              className="btn-admin-action edit" 
                                              onClick={() => handleStartEditSlot(slot)}
                                            >
                                              Sửa
                                            </button>
                                            <button 
                                              className="btn-admin-action delete" 
                                              onClick={() => handleDeleteSlotClick(slot.accountSlotId)}
                                            >
                                              Xóa
                                            </button>
                                          </div>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}

      <AdminConfirmModal
        open={pendingDeleteSlotId !== null}
        variant="danger"
        title="Xác nhận xóa Slot?"
        description="Bạn có chắc chắn muốn xóa Slot này không? Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        onConfirm={executeDeleteSlot}
        onCancel={() => setPendingDeleteSlotId(null)}
      />
    </>
  );
}
