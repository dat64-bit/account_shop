"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/Portal';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';


const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const ArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const Save = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
);

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Filters & Keyset Pagination
  const [categoryIdFilter, setCategoryIdFilter] = useState<number | undefined>(undefined);
  const [statusIdFilter, setStatusIdFilter] = useState<number | undefined>(undefined);
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

  // View State
  const [view, setView] = useState<'list' | 'details' | 'form'>('list');

  // Product CRUD
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    productName: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    isContactSeller: false,
    isInputEmailRequired: false,
    productStatusId: 1
  });

  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Product Details & Plans Management
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productPlans, setProductPlans] = useState<any[]>([]);
  const [durationPlans, setDurationPlans] = useState<any[]>([]);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({
    planId: '',
    price: 0,
    isActive: true
  });

  // Status Confirmation
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);

  // Notifications
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMetadata = async () => {
    try {
      const catRes = await api.get('/admin/categories?limit=1000');
      setCategories(catRes.data.content || catRes.data || []);

      const durationRes = await api.get('/admin/subscription-plans?limit=1000');
      setDurationPlans(durationRes.data.content || durationRes.data || []);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const fetchProducts = async (lastId: number | null, page: number) => {
    setLoading(true);
    try {
      let url = `/admin/products?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (categoryIdFilter !== undefined) url += `&categoryId=${categoryIdFilter}`;
      if (statusIdFilter !== undefined) url += `&statusId=${statusIdFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const productsRes = await api.get(url);
      setProducts(productsRes.data.content || []);
      setHasMore(productsRes.data.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (isMounted) {
      setCursors([null]);
      fetchProducts(null, 1);
    }
  }, [categoryIdFilter, statusIdFilter, debouncedKeyword, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchProducts(prevLastId, prevPage);
    }
  };

  const handleNext = () => {
    if (hasMore && products.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = products[products.length - 1].productId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchProducts(currentLastId, nextPage);
    }
  };

  const fetchProductPlans = async (productId: number) => {
    try {
      const res = await api.get(`/admin/product-subscriptions?productId=${productId}&limit=100`);
      const subList = res.data.content || [];

      const filtered = subList.map((p: any) => {
        const duration = durationPlans.find((d: any) => d.planId === p.planId);
        return {
          ...p,
          planName: duration?.planName || 'N/A',
          durationDays: duration?.durationDays || 0
        };
      });
      setProductPlans(filtered);
    } catch (err) {
      console.error("Error fetching product plans:", err);
      setProductPlans([]);
    }
  };


  const handleOpenDetails = (product: any) => {
    setSelectedProduct(product);
    setView('details');
    fetchProductPlans(product.productId);
  };

  const handleOpenForm = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        productName: product.productName,
        categoryId: product.categoryId,
        description: product.description,
        imageUrl: product.imageUrl,
        isContactSeller: product.isContactSeller,
        isInputEmailRequired: product.isInputEmailRequired,
        productStatusId: product.productStatusId
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        productName: '',
        categoryId: categories[0]?.categoryId || '',
        description: '',
        imageUrl: '',
        isContactSeller: false,
        isInputEmailRequired: false,
        productStatusId: 1
      });
    }
    setView('form');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadImageFile(file);
    }
  };

  const handleChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await uploadImageFile(file);
    }
  };

  const uploadImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Chỉ chấp nhận các file định dạng hình ảnh!');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductForm(prev => ({ ...prev, imageUrl: res.data.url }));
      showToast('success', 'Đăng tải hình ảnh thành công!');
    } catch (err: any) {
      console.error("Error uploading image:", err);
      showToast('error', err.response?.data || 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleProductStatus = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 2 : 1;
    try {
      await api.put(`/admin/products/${id}/status?statusId=${newStatus}`);
      fetchProducts(cursors[currentPage - 1], currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct
      ? `/admin/products/${editingProduct.productId}`
      : `/admin/products`;
    const method = editingProduct ? 'put' : 'post';

    try {
      await api[method](url, productForm);
      showToast('success', editingProduct ? 'Đã cập nhật sản phẩm thành công!' : 'Đã tạo sản phẩm mới thành công!');
      fetchProducts(cursors[currentPage - 1], currentPage);
      setView('list');
    } catch (error) {
      console.error("Error saving product:", error);
      showToast('error', 'Có lỗi xảy ra khi lưu sản phẩm.');
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      productId: selectedProduct.productId,
      planId: Number(planForm.planId),
      price: Number(planForm.price),
      isActive: planForm.isActive,
      ...(editingPlan ? { productSubscriptionId: editingPlan.productSubscriptionId } : {})
    };

    try {
      await api.post('/admin/product-subscriptions', body);
      showToast('success', editingPlan ? 'Đã cập nhật giá bán thành công!' : 'Đã thêm mức giá mới thành công!');
      fetchProductPlans(selectedProduct.productId);
      setPlanModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'Có lỗi xảy ra khi lưu bảng giá.');
    }
  };

  const handleTogglePlanStatus = async (plan: any) => {
    try {
      await api.put(`/admin/product-subscriptions/${plan.productSubscriptionId}/status?isActive=${!plan.isActive}`);
      fetchProductPlans(selectedProduct.productId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

  return (
    <div className="space-y-6">
      {/* 1. VIEW: LIST */}
      {view === 'list' && (
        <div className="admin-table-container animate-in">
          <div className="card-header border-b border-slate-100">
            <h2 className="card-title">Danh sách sản phẩm</h2>
            <button className="btn-primary" onClick={() => handleOpenForm()}>
              <Plus /> Thêm sản phẩm
            </button>
          </div>

          {/* Bộ lọc động */}
          <div style={{ display: 'flex', gap: '16px', padding: '20px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm..."
                className="form-input"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
              />
            </div>
            <div style={{ width: '200px' }}>
              <select
                className="form-input"
                value={categoryIdFilter === undefined ? 'all' : categoryIdFilter}
                onChange={e => {
                  const val = e.target.value;
                  setCategoryIdFilter(val === 'all' ? undefined : Number(val));
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
            <div style={{ width: '180px' }}>
              <select
                className="form-input"
                value={statusIdFilter === undefined ? 'all' : statusIdFilter}
                onChange={e => {
                  const val = e.target.value;
                  setStatusIdFilter(val === 'all' ? undefined : Number(val));
                }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)' }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="1">Đang kinh doanh</option>
                <option value="2">Ngừng bán hàng</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Không tìm thấy sản phẩm nào.</td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.productId}>
                      <td>#{p.productId}</td>
                      <td>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: 4, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <Plus />
                          </div>
                        )}
                      </td>
                      <td className="admin-text-bold">{p.productName}</td>
                      <td>
                        <span className={`admin-badge ${p.productStatusId === 1 ? 'success' : 'danger'}`}>
                          {p.productStatusId === 1 ? 'Kinh doanh' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <div className="admin-table-actions">
                          <button className="btn-admin-action view" onClick={() => handleOpenDetails(p)}>Chi tiết</button>
                          <button 
                            className={`btn-admin-action ${p.productStatusId === 1 ? 'lock' : 'edit'}`} 
                            onClick={() => handleToggleProductStatus(p.productId, p.productStatusId)}
                          >
                            {p.productStatusId === 1 ? 'Dừng' : 'Bán lại'}
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
        </div>
      )}

      {/* 2. VIEW: FORM (ADD/EDIT PRODUCT) */}
      {view === 'form' && (
        <div className="animate-in">
          <div className="admin-header-premium">
            <div className="admin-header-left">
              <button
                onClick={() => setView('list')}
                className="btn-back-circle"
                title="Quay lại danh sách"
                style={{ width: '48px', height: '48px' }}
              >
                <ArrowLeft />
              </button>
              <div className="admin-header-title">
                <nav>HỆ THỐNG / {editingProduct ? 'CHỈNH SỬA' : 'TẠO MỚI'}</nav>
                <h2>{editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              </div>
            </div>
            <div className="admin-header-actions">
              <button
                type="button"
                className="btn-view-account"
                onClick={() => setView('list')}
                style={{ padding: '12px 24px', fontWeight: '700' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={(e) => handleSaveProduct(e as any)}
                style={{ padding: '12px 28px', gap: '10px', display: 'flex', alignItems: 'center' }}
              >
                <Save /> <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveProduct} className="admin-form-grid">
            {/* Main Info */}
            <div className="admin-form-main space-y-6">
              <div className="content-card">
                <div className="card-header border-b border-slate-100">
                  <h3 className="card-title flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Thông tin cơ bản
                  </h3>
                </div>
                <div className="admin-card-body space-y-6">
                  <div className="admin-form-group">
                    <label className="admin-label">Tên sản phẩm</label>
                    <input
                      type="text"
                      className="admin-input-premium"
                      placeholder="VD: Netflix Premium 1 Tháng..."
                      value={productForm.productName}
                      onChange={e => setProductForm({ ...productForm, productName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Mô tả sản phẩm</label>
                    <textarea
                      className="admin-input-premium admin-textarea-premium"
                      placeholder="Nhập mô tả chi tiết sản phẩm..."
                      value={productForm.description}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      rows={6}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header border-b border-slate-100">
                  <h3 className="card-title flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Cài đặt nâng cao
                  </h3>
                </div>
                <div className="admin-card-body grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`admin-toggle-card ${productForm.isContactSeller ? 'active' : ''}`}
                    onClick={() => setProductForm({ ...productForm, isContactSeller: !productForm.isContactSeller })}
                  >
                    <div className="flex items-center gap-4">
                      <div className="admin-toggle-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.9A8.38 8.38 0 0 1 4 11.3a8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      </div>
                      <div className="admin-toggle-info">
                        <h4>Liên hệ người bán</h4>
                        <p>Khách sẽ chat để mua</p>
                      </div>
                    </div>
                    <div className={`admin-switch ${productForm.isContactSeller ? 'active' : ''}`}>
                      <div className="admin-switch-dot"></div>
                    </div>
                  </div>

                  <div
                    className={`admin-toggle-card ${productForm.isInputEmailRequired ? 'active' : ''}`}
                    onClick={() => setProductForm({ ...productForm, isInputEmailRequired: !productForm.isInputEmailRequired })}
                  >
                    <div className="flex items-center gap-4">
                      <div className="admin-toggle-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </div>
                      <div className="admin-toggle-info">
                        <h4>Yêu cầu Email</h4>
                        <p>Bắt buộc nhập khi mua</p>
                      </div>
                    </div>
                    <div className={`admin-switch ${productForm.isInputEmailRequired ? 'active' : ''}`}>
                      <div className="admin-switch-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="content-card">
                <div className="card-header border-b border-slate-100">
                  <h3 className="card-title flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    Hình ảnh & Phân loại
                  </h3>
                </div>
                <div className="admin-card-body space-y-6">
                  <div className="admin-form-group">
                    <label className="admin-label">Danh mục</label>
                    <div className="admin-select-wrapper">
                      <select
                        className="admin-input-premium"
                        value={productForm.categoryId}
                        onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                        required
                      >
                        {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>)}
                      </select>
                      <div className="admin-select-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Hình ảnh sản phẩm</label>
                    
                    {uploading ? (
                      <div className="admin-image-empty">
                        <div className="admin-upload-spinner"></div>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Đang tải ảnh lên...</span>
                      </div>
                    ) : productForm.imageUrl ? (
                      <div className="admin-image-preview group">
                        <img
                          src={productForm.imageUrl}
                          alt="Preview"
                          className="w-full h-auto rounded-xl object-contain max-h-48 transition-transform duration-500 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => setProductForm(prev => ({ ...prev, imageUrl: '' }))}
                          title="Xóa hình ảnh"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`admin-image-empty ${dragActive ? 'dragging' : ''}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('product-image-upload')?.click()}
                      >
                        <input
                          type="file"
                          id="product-image-upload"
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleChangeFile}
                        />
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-center">Kéo thả ảnh hoặc click để chọn</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Hoặc nhập link ảnh trực tiếp</label>
                    <input
                      type="text"
                      className="admin-input-premium"
                      placeholder="https://example.com/image.png"
                      value={productForm.imageUrl}
                      onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="content-card">
                <div className="card-header border-b border-slate-100">
                  <h3 className="card-title flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    Trạng thái niêm yết
                  </h3>
                </div>
                <div className="admin-card-body">
                  <div className="admin-status-grid">
                    <button
                      type="button"
                      className={`admin-status-btn ${productForm.productStatusId === 1 ? 'active success' : ''}`}
                      onClick={productForm.productStatusId === 1 ? undefined : () => {
                        setPendingStatusId(1);
                        setStatusConfirmOpen(true);
                      }}
                      style={{ cursor: productForm.productStatusId === 1 ? 'default' : 'pointer' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Đang kinh doanh
                    </button>
                    <button
                      type="button"
                      className={`admin-status-btn ${productForm.productStatusId === 2 ? 'active danger' : ''}`}
                      onClick={productForm.productStatusId === 2 ? undefined : () => {
                        setPendingStatusId(2);
                        setStatusConfirmOpen(true);
                      }}
                      style={{ cursor: productForm.productStatusId === 2 ? 'default' : 'pointer' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                      Ngừng bán hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {statusConfirmOpen && (
        <Portal>
          <div className="admin-modal-overlay">
            <div className="admin-confirm-modal animate-in zoom-in duration-300">
              <div className={`confirm-icon-wrapper ${pendingStatusId === 2 ? 'warning' : 'info'}`}>
                {pendingStatusId === 2 ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                )}
              </div>
              <h3 className="confirm-title">
                {pendingStatusId === 2 ? 'Xác nhận ngừng bán?' : 'Xác nhận mở bán lại?'}
              </h3>
              <p className="confirm-desc">
                {pendingStatusId === 2 
                  ? 'Sản phẩm sẽ không còn hiển thị trên trang chủ và khách hàng không thể đặt mua.' 
                  : 'Sản phẩm sẽ hiển thị công khai trên cửa hàng để khách hàng có thể mua sắm.'}
              </p>
              <div className="confirm-actions">
                <button 
                  className="btn-confirm-cancel" 
                  onClick={() => setStatusConfirmOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  className={`btn-confirm-action ${pendingStatusId === 2 ? 'danger' : ''}`}
                  onClick={() => {
                    setProductForm({...productForm, productStatusId: pendingStatusId!});
                    setStatusConfirmOpen(false);
                    showToast('success', 'Đã thay đổi trạng thái niêm yết.');
                  }}
                >
                  Xác nhận thay đổi
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="admin-toast-container animate-in slide-in-from-right duration-300">
          <div className={`admin-toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              )}
            </div>
            <div className="toast-content">
              <h5>{toast.type === 'success' ? 'Thành công' : 'Thất bại'}</h5>
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW: DETAILS & PLANS */}
      {view === 'details' && selectedProduct && (
        <div className="details-view-container animate-in">
          {/* Enhanced Header */}
          <div className="details-header-premium">
            <div className="header-left-side">
              <button
                onClick={() => setView('list')}
                className="btn-back-circle"
                title="Quay lại danh sách"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </button>
              <div className="header-title-group">
                <nav>Hệ thống / Sản phẩm</nav>
                <h2>{selectedProduct.productName}</h2>
              </div>
            </div>
            <div className="header-actions-group">
              <button
                className="btn-view-account"
                onClick={() => handleOpenForm(selectedProduct)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Sửa thông tin
              </button>
            </div>
          </div>

          <div className="details-main-grid">
            {/* Sidebar Info Card */}
            <div className="product-info-sidebar">
              <div className="info-card-premium">
                <img src={selectedProduct.imageUrl} alt="" className="info-card-img" />
                <div className="info-card-body">
                  <span className="info-section-title">Mô tả sản phẩm</span>
                  <div className="product-desc-box">
                    {selectedProduct.description || 'Không có mô tả chi tiết cho sản phẩm này.'}
                  </div>

                  <span className="info-section-title">Thông số kỹ thuật</span>
                  <div className="info-meta-list">
                    <div className="meta-item">
                      <span className="meta-label">Trạng thái:</span>
                      <span className={`status-badge ${selectedProduct.productStatusId === 1 ? 'completed' : 'open'}`}>
                        {selectedProduct.productStatusId === 1 ? 'Đang bán' : 'Tạm ngưng'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Loại giao dịch:</span>
                      <span className="meta-value">{selectedProduct.isContactSeller ? 'Chat trực tiếp' : 'Mua tự động'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Yêu cầu Email:</span>
                      <span className="meta-value">{selectedProduct.isInputEmailRequired ? 'Có' : 'Không'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content: Plans & Pricing */}
            <div className="pricing-card-premium">
              <div className="pricing-card-header">
                <div className="pricing-title-group">
                  <h3>Bảng giá Niêm yết</h3>
                  <p>Thiết lập các mức giá dựa trên thời gian sử dụng</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEditingPlan(null);
                    setPlanForm({
                      planId: durationPlans[0]?.planId || '',
                      price: 0,
                      isActive: true
                    });
                    setPlanModalOpen(true);
                  }}
                >
                  <Plus /> Thêm mức giá mới
                </button>
              </div>
              <div className="table-responsive">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Gói thời hạn</th>
                      <th>Giá bán</th>
                      <th>Thời hạn</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPlans.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty-pricing-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <h4>Chưa có bảng giá</h4>
                            <p>Hãy thêm các gói thời gian để khách hàng có thể chọn mua sản phẩm này.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      productPlans.map(plan => (
                        <tr key={plan.productSubscriptionId}>
                          <td>
                            <div className="plan-name-cell">
                              <div className="plan-icon-box">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                              </div>
                              <strong>{plan.planName}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="price-text-bold">{plan.price.toLocaleString()}đ</span>
                          </td>
                          <td>
                            <span className="duration-badge">{plan.durationDays} ngày</span>
                          </td>
                          <td>
                            <span className={`status-badge ${plan.isActive ? 'completed' : 'open'}`}>
                              {plan.isActive ? 'Đang mở' : 'Đã ẩn'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-group">
                              <button
                                className="btn-action-icon edit"
                                title="Sửa giá"
                                onClick={() => {
                                  setEditingPlan(plan);
                                  setPlanForm({
                                    planId: plan.planId,
                                    price: plan.price,
                                    isActive: plan.isActive
                                  });
                                  setPlanModalOpen(true);
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                              </button>
                              <button
                                className="btn-action-icon toggle"
                                title={plan.isActive ? 'Tạm ẩn' : 'Hiển thị'}
                                onClick={() => handleTogglePlanStatus(plan)}
                              >
                                {plan.isActive ? (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                ) : (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nhỏ cho việc nhập giá (Vẫn dùng Popup vì đây là form cực đơn giản - Confirm style) */}
      {planModalOpen && (
        <Portal>
          <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-container animate-in" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h3>{editingPlan ? 'Sửa giá gói' : 'Thêm giá gói'}</h3>
                <button className="btn-close" onClick={() => setPlanModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleSavePlan} className="modal-body">
                <div className="form-group">
                  <label>Chọn thời hạn</label>
                  <select className="form-input" value={planForm.planId} onChange={e => setPlanForm({ ...planForm, planId: e.target.value })} required disabled={!!editingPlan}>
                    {durationPlans.map(d => <option key={d.planId} value={d.planId}>{d.planName} ({d.durationDays} ngày)</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={planForm.price === 0 ? '' : planForm.price}
                    onChange={e => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    onFocus={e => e.target.select()}
                    placeholder="Nhập giá..."
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-view-account" onClick={() => setPlanModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Lưu lại</button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
