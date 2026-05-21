"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [durationPlans, setDurationPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [form, setForm] = useState({ productId: '', planId: '', price: 0, isActive: true });
  const { toast, showToast } = useAdminToast();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const productsRes = await fetch('http://localhost:8080/api/public/catalog/products');
      if (!productsRes.ok) {
        showToast('Lỗi tải danh sách sản phẩm từ hệ thống.', 'error');
        setLoading(false);
        return;
      }
      const productsData = await productsRes.json();
      setProducts(productsData);

      const durationRes = await fetch('http://localhost:8080/api/admin/subscription-plans', { headers });
      if (!durationRes.ok) {
        if (durationRes.status === 401 || durationRes.status === 403) {
          showToast('Phiên đăng nhập hết hạn hoặc không có quyền truy cập.', 'error');
        } else {
          showToast(`Lỗi tải cấu hình thời hạn gói (${durationRes.status})`, 'error');
        }
        setLoading(false);
        return;
      }
      const durationData = await durationRes.json();
      setDurationPlans(durationData);

      const subRes = await fetch('http://localhost:8080/api/admin/product-subscriptions', { headers });
      if (!subRes.ok) {
        showToast(`Lỗi tải danh sách gói đăng ký (${subRes.status})`, 'error');
        setLoading(false);
        return;
      }
      const subData = await subRes.json();

      const joinedData = (Array.isArray(subData) ? subData : []).map((sub: any) => {
        const product = productsData.find((p: any) => p.productId === sub.productId);
        const duration = durationData.find((d: any) => d.planId === sub.planId);
        return { ...sub, productName: product?.productName || 'N/A', planName: duration?.planName || 'N/A', durationDays: duration?.durationDays || 0 };
      });
      setPlans(joinedData);
    } catch (error) {
      console.error("Error fetching plans data:", error);
      showToast('Lỗi kết nối máy chủ khi tải dữ liệu gói.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/admin/product-subscriptions/${id}/status?isActive=${!currentActive}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Cập nhật trạng thái gói thành công.', 'success');
        fetchData();
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
      const res = await fetch('http://localhost:8080/api/admin/product-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setModalOpen(false);
        showToast(editingSub ? 'Cập nhật gói thành công.' : 'Thêm gói mới thành công.', 'success');
        fetchData();
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
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

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
              {plans.map(plan => (
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
              ))}
            </tbody>
          </table>
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
