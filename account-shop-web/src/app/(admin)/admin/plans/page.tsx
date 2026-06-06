"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/common/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';
import { useKeysetPagination } from '@/hooks/useKeysetPagination';

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

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [form, setForm] = useState({ productId: '', planId: '', price: 0, isActive: true });
  const { showToast } = useAdminToast();

  // Load products & duration plans once
  const loadStaticData = async () => {
    try {
      const productsRes = await api.get('/public/catalog/products');
      const productsData = productsRes.data || [];
      setProducts(productsData);

      const durationRes = await api.get('/admin/subscription-plans?limit=100');
      const durationJson = durationRes.data;
      const durationData = durationJson.content || durationJson || [];
      setDurationPlans(durationData);

      return { productsData, durationData };
    } catch (error) {
      console.error("Error loading static data:", error);
      showToast('Lỗi tải dữ liệu hoặc kết nối máy chủ.', 'error');
      return { productsData: [], durationData: [] };
    }
  };

  const fetchSubscriptions = async (lastId: number | null, page: number, staticProds?: any[], staticDurations?: any[]) => {
    setLoading(true);
    try {
      let url = `/admin/product-subscriptions?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (productIdFilter !== undefined) url += `&productId=${productIdFilter}`;

      const res = await api.get(url);
      const subList = res.data.content || [];
      
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
      setHasMore(res.data.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      showToast('Lỗi kết nối máy chủ hoặc tải gói đăng ký.', 'error');
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
  } = useKeysetPagination(
    (lastId, page) => fetchSubscriptions(lastId, page),
    (plan: any) => plan.productSubscriptionId
  );

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
      resetPagination();
      fetchSubscriptions(null, 1);
    }
  }, [productIdFilter, isMounted]);



  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    try {
      await api.put(`/admin/product-subscriptions/${id}/status?isActive=${!currentActive}`);
      showToast('Cập nhật trạng thái gói thành công.', 'success');
      fetchSubscriptions(cursors[currentPage - 1], currentPage);
    } catch (err) {
      console.error(err);
      showToast('Lỗi cập nhật trạng thái gói hoặc kết nối máy chủ.', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = {
      productId: Number(form.productId),
      planId: Number(form.planId),
      price: Number(form.price),
      isActive: form.isActive
    };
    if (editingSub) body.productSubscriptionId = editingSub.productSubscriptionId;

    try {
      await api.post('/admin/product-subscriptions', body);
      setModalOpen(false);
      showToast(editingSub ? 'Cập nhật gói thành công.' : 'Thêm gói mới thành công.', 'success');
      fetchSubscriptions(cursors[currentPage - 1], currentPage);
    } catch (error: any) {
      console.error("Error saving plan:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Lỗi hệ thống hoặc kết nối.';
      showToast(`Lỗi: ${errorMsg}`, 'error');
    }
  };

  const planColumns: Column[] = [
    { title: 'ID', dataIndex: 'productSubscriptionId', render: (id: number) => `#${id}` },
    { title: 'Sản phẩm', dataIndex: 'productName' },
    { title: 'Tên gói', dataIndex: 'planName', render: (val: string) => <span className="admin-text-bold">{val}</span> },
    { title: 'Giá bán', dataIndex: 'price', render: (val: number) => <span className="admin-text-price">{val?.toLocaleString()}đ</span> },
    { title: 'Thời hạn (Ngày)', dataIndex: 'durationDays', render: (val: number) => `${val} ngày` },
    {
      title: 'Trạng thái', dataIndex: 'isActive', render: (isActive: boolean) => (
        <span className={`admin-badge ${isActive ? 'success' : 'warning'}`}>
          {isActive ? 'Đang bán' : 'Tạm dừng'}
        </span>
      )
    },
    {
      title: 'Thao tác', dataIndex: 'actions', render: (_: any, plan: any) => (
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
      )
    }
  ];

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
          <div className="admin-filter-bar">
            <div className="admin-filter-select-wrapper w-220">
              <select
                className="admin-filter-select"
                value={productIdFilter === undefined ? 'all' : productIdFilter.toString()}
                onChange={e => {
                  const val = e.target.value;
                  setProductIdFilter(val === 'all' ? undefined : parseInt(val));
                }}
              >
                <option value="all">Tất cả sản phẩm</option>
                {products.map(p => (
                  <option key={p.productId} value={p.productId}>{p.productName}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="table-loading-cell">Đang tải danh sách gói đăng ký...</div>
          ) : (
            <>
              <AdminTable 
                columns={planColumns} 
                data={plans} 
                rowKey="productSubscriptionId" 
                emptyText="Không tìm thấy gói nào." 
              />
              <AdminPagination
                currentPage={currentPage}
                hasMore={hasMore}
                onPrev={handlePrev}
                onNext={() => handleNext(plans)}
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
    </>
  );
}
