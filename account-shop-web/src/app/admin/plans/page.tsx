"use client";

import { useState, useEffect } from 'react';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]); // ProductSubscription joined with Product and SubscriptionPlan
  const [products, setProducts] = useState<any[]>([]);
  const [durationPlans, setDurationPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [form, setForm] = useState({
    productId: '',
    planId: '',
    price: 0,
    isActive: true
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Products
      const productsRes = await fetch('http://localhost:8080/api/public/catalog/products');
      const productsData = await productsRes.json();
      setProducts(productsData);

      // 2. Fetch Duration Plans (SubscriptionPlan)
      const durationRes = await fetch('http://localhost:8080/api/admin/subscription-plans', { headers });
      const durationData = await durationRes.json();
      setDurationPlans(durationData);

      // 3. Fetch Product Subscriptions (Pricing entries)
      const subRes = await fetch('http://localhost:8080/api/admin/product-subscriptions', { headers });
      const subData = await subRes.json();

      // Join data for display
      const joinedData = subData.map((sub: any) => {
        const product = productsData.find((p: any) => p.productId === sub.productId);
        const duration = durationData.find((d: any) => d.planId === sub.planId);
        return {
          ...sub,
          productName: product?.productName || 'N/A',
          planName: duration?.planName || 'N/A',
          durationDays: duration?.durationDays || 0
        };
      });

      setPlans(joinedData);
    } catch (error) {
      console.error("Error fetching plans data:", error);
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
      await fetch(`http://localhost:8080/api/admin/product-subscriptions/${id}/status?isActive=${!currentActive}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Đảm bảo dữ liệu gửi lên backend chỉ chứa các trường cần thiết
    const body: any = {
      productId: Number(form.productId),
      planId: Number(form.planId),
      price: Number(form.price),
      isActive: form.isActive
    };

    if (editingSub) {
      body.productSubscriptionId = editingSub.productSubscriptionId;
    }

    console.log("Saving with token:", token ? (token.substring(0, 10) + "...") : "MISSING");
    try {
      const res = await fetch('http://localhost:8080/api/admin/product-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      } else {
        let errorMsg = "";
        try {
          const text = await res.text();
          try {
            const json = JSON.parse(text);
            errorMsg = json.message || json.error || text;
          } catch (e) {
            errorMsg = text || res.statusText || "Lỗi không xác định";
          }
        } catch (e) {
          errorMsg = res.statusText || "Lỗi hệ thống";
        }
        alert("Lỗi (" + res.status + "): " + errorMsg);
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      alert("Lỗi kết nối server");
    }
  };

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <div className="space-y-6">
    <div className="admin-table-container animate-in">
      <div className="card-header border-b border-slate-100">
        <h2 className="card-title">Quản lý Gói đăng ký</h2>
        <button className="btn-primary" onClick={() => {
          setEditingSub(null);
          setForm({
            productId: products[0]?.productId || '',
            planId: durationPlans[0]?.planId || '',
            price: 0,
            isActive: true
          });
          setModalOpen(true);
        }}><Plus /> Thêm gói mới</button>
      </div>
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
                        setForm({
                          productId: plan.productId,
                          planId: plan.planId,
                          price: plan.price,
                          isActive: plan.isActive
                        });
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
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container animate-in">
            <div className="modal-header">
              <h3>{editingSub ? 'Sửa gói đăng ký' : 'Thêm gói mới'}</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-group">
                <label>Sản phẩm</label>
                <select className="form-input" value={form.productId} onChange={e => setForm({...form, productId: e.target.value})} required>
                  {products.map(p => <option key={p.productId} value={p.productId}>{p.productName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Thời hạn (Gói)</label>
                <select className="form-input" value={form.planId} onChange={e => setForm({...form, planId: e.target.value})} required>
                  {durationPlans.map(d => <option key={d.planId} value={d.planId}>{d.planName} ({d.durationDays} ngày)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Giá bán (VNĐ)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={form.price === 0 ? '' : form.price} 
                  onChange={e => setForm({...form, price: e.target.value === '' ? 0 : Number(e.target.value)})} 
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
      )}
    </div>
  );
}
