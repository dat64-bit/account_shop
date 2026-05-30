"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [durationPlans, setDurationPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filters & Keyset Pagination States
  const [productIdFilter, setProductIdFilter] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cursors, setCursors] = useState<(number | null)[]>([null]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [form, setForm] = useState({ productId: '', planId: '', price: 0, isActive: true });
  const { toast, showToast } = useAdminToast();

  // Load products & duration plans once
  const loadStaticData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const productsRes = await fetch(`${API_BASE_URL}/api/public/catalog/products`);
      let productsData: any[] = [];
      if (productsRes.ok) {
        productsData = await productsRes.json();
        setProducts(productsData);
      } else {
        showToast('Lỗi tải danh sách sản phẩm.', 'error');
      }

      const durationRes = await fetch(`${API_BASE_URL}/api/admin/subscription-plans?limit=100`, { headers });
      let durationData: any[] = [];
      if (durationRes.ok) {
        const durationJson = await durationRes.json();
        durationData = durationJson.content || durationJson || [];
        setDurationPlans(durationData);
      } else {
        showToast('Lỗi tải cấu hình thời hạn gói.', 'error');
      }

      return { productsData, durationData };
    } catch (error) {
      console.error("Error loading static data:", error);
      showToast('Lỗi kết nối máy chủ.', 'error');
      return { productsData: [], durationData: [] };
    }
  };

  const fetchSubscriptions = async (lastId: number | null, page: number, staticProds?: any[], staticDurations?: any[]) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      let url = `${API_BASE_URL}/api/admin/product-subscriptions?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (productIdFilter !== undefined) url += `&productId=${productIdFilter}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const subList = data.content || [];
        
        const prods = staticProds || products;
        const durations = staticDurations || durationPlans;

        const joinedData = subList.map((sub: any) => {
          const product = prods.find((p: any) => p.productId === sub.productId);
          const duration = durations.find((d: any) => d.planId === sub.planId);
          return {
            ...sub,
            productName: product?.productName || 'N/A',
            planName: duration?.planName || 'N/A',
            durationDays: duration?.durationDays || 0
          };
        });

        setPlans(joinedData);
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
      } else {
        showToast('Lỗi khi tải danh sách gói đăng ký.', 'error');
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      showToast('Lỗi kết nối máy chủ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsMounted(true);
      const { productsData, durationData } = await loadStaticData();
      await fetchSubscriptions(null, 1, productsData, durationData);
    };
    init();
  }, []);

  // Fetch when product filter changes
  useEffect(() => {
    if (isMounted) {
      setCursors([null]);
      fetchSubscriptions(null, 1);
    }
  }, [productIdFilter, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchSubscriptions(prevLastId, prevPage);
    }
  };

  const handleNext = () => {
    if (hasMore && plans.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = plans[plans.length - 1].productSubscriptionId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchSubscriptions(currentLastId, nextPage);
    }
  };

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/product-subscriptions/${id}/status?isActive=${!currentActive}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Cập nhật trạng thái gói thành công.', 'success');
        fetchSubscriptions(cursors[currentPage - 1], currentPage);
      } else {
        showToast(`Lỗi cập nhật trạng thái gói (${res.status})`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const body: any = {
      productId: Number(form.productId),
      planId: Number(form.planId),
      price: Number(form.price),
      isActive: form.isActive
    };
    if (editingSub) body.productSubscriptionId = editingSub.productSubscriptionId;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/product-subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setModalOpen(false);
        showToast(editingSub ? 'Cập nhật gói thành công.' : 'Thêm gói mới thành công.', 'success');
        fetchSubscriptions(cursors[currentPage - 1], currentPage);
      } else {
        let errorMsg = "";
        try {
          const text = await res.text();
          try { const json = JSON.parse(text); errorMsg = json.message || json.error || text; } catch { errorMsg = text || res.statusText || "Lỗi không xác định"; }
        } catch { errorMsg = res.statusText || "Lỗi hệ thống"; }
        showToast(`Lỗi (${res.status}): ${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      showToast('Lỗi kết nối máy chủ.', 'error');
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="space-y-6">
        <AdminTableCard
          title="Quản lý Gói đăng ký"
          headerAction={
            <button className="btn-primary" onClick={() => {
              setEditingSub(null);
              setForm({ productId: products[0]?.productId || '', planId: durationPlans[0]?.planId || '', price: 0, isActive: true });
              setModalOpen(true);
            }}>
              <Plus /> Thêm gói mới
            </button>
          }
        >
          {/* Bộ lọc động */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ width: '220px' }}>
              <select
                className="form-input"
                value={productIdFilter === undefined ? 'all' : productIdFilter.toString()}
                onChange={e => {
                  const val = e.target.value;
                  setProductIdFilter(val === 'all' ? undefined : parseInt(val));
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
              >
                <option value="all">Tất cả sản phẩm</option>
                {products.map(p => (
                  <option key={p.productId} value={p.productId}>{p.productName}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse" style={{ padding: '20px', textAlign: 'center' }}>Đang tải danh sách gói đăng ký...</div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Sản phẩm</th>
                      <th>Tên gói</th>
                      <th>Giá bán</th>
                      <th>Thời hạn (Ngày)</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy gói nào.</td>
                      </tr>
                    ) : (
                      plans.map(plan => (
                        <tr key={plan.productSubscriptionId}>
                          <td>#{plan.productSubscriptionId}</td>
                          <td>{plan.productName}</td>
                          <td className="admin-text-bold">{plan.planName}</td>
                          <td className="admin-text-price">{plan.price.toLocaleString()}đ</td>
                          <td>{plan.durationDays} ngày</td>
                          <td>
                            <span className={`admin-badge ${plan.isActive ? 'success' : 'warning'}`}>
                              {plan.isActive ? 'Đang bán' : 'Tạm dừng'}
                            </span>
                          </td>
                          <td className="admin-actions-cell">
                            <div className="admin-table-actions">
                              <button className="btn-admin-action edit" onClick={() => {
                                setEditingSub(plan);
                                setForm({ productId: plan.productId, planId: plan.planId, price: plan.price, isActive: plan.isActive });
                                setModalOpen(true);
                              }}>Sửa</button>
                              <button
                                className={`btn-admin-action ${plan.isActive ? 'lock' : 'edit'}`}
                                onClick={() => handleToggleStatus(plan.productSubscriptionId, plan.isActive)}
                              >
                                {plan.isActive ? 'Dừng' : 'Bán'}
                              </button>
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

        {modalOpen && (
          <Portal>
            <div className="modal-overlay">
              <div className="modal-container animate-in">
                <div className="modal-header">
                  <h3>{editingSub ? 'Sửa gói đăng ký' : 'Thêm gói mới'}</h3>
                  <button className="btn-close" onClick={() => setModalOpen(false)}>&times;</button>
                </div>
                <form onSubmit={handleSave} className="modal-body">
                  <div className="form-group">
                    <label>Sản phẩm</label>
                    <select className="form-input" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required>
                      {products.map(p => <option key={p.productId} value={p.productId}>{p.productName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Thời hạn (Gói)</label>
                    <select className="form-input" value={form.planId} onChange={e => setForm({ ...form, planId: e.target.value })} required>
                      {durationPlans.map(d => <option key={d.planId} value={d.planId}>{d.planName} ({d.durationDays} ngày)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giá bán (VNĐ)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.price === 0 ? '' : form.price}
                      onChange={e => setForm({ ...form, price: e.target.value === '' ? 0 : Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      placeholder="Nhập giá bán..."
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-view-account" onClick={() => setModalOpen(false)}>Hủy</button>
                    <button type="submit" className="btn-primary">Lưu lại</button>
                  </div>
                </form>
              </div>
            </div>
          </Portal>
        )}
      </div>

      <AdminToast toast={toast} />
    </>
  );
}
