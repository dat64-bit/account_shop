"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19">
    </line>
    <line x1="5" y1="12" x2="19" y2="12">
    </line>
  </svg>
);

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    categoryName: '',
    description: '',
    isActive: true
  });
  const { toast, showToast } = useAdminToast();
  const [pendingCategory, setPendingCategory] = useState<any>(null);

  // Filters & Keyset Pagination States
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
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

  const fetchData = async (lastId: number | null, page: number) => {
    setLoading(true);
    try {
      let url = `/admin/categories?limit=15`;
      if (lastId !== null) url += `&lastId=${lastId}`;
      if (isActiveFilter !== undefined) url += `&isActive=${isActiveFilter}`;
      if (debouncedKeyword.trim()) url += `&keyword=${encodeURIComponent(debouncedKeyword.trim())}`;

      const catRes = await api.get(url);
      setCategories(catRes.data.content || []);
      setHasMore(catRes.data.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast('Lỗi kết nối máy chủ hoặc tải danh mục.', 'error');
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
  }, [isActiveFilter, debouncedKeyword, isMounted]);

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      const prevLastId = cursors[prevPage - 1];
      fetchData(prevLastId, prevPage);
    }
  };

  const handleNext = () => {
    if (hasMore && categories.length > 0) {
      const nextPage = currentPage + 1;
      const currentLastId = categories[categories.length - 1].categoryId;
      setCursors(prev => {
        const nextCursors = [...prev];
        nextCursors[nextPage - 1] = currentLastId;
        return nextCursors;
      });
      fetchData(currentLastId, nextPage);
    }
  };

  const handleToggleCategoryStatus = (category: any) => {
    if (category.isActive) {
      setPendingCategory(category);
    } else {
      executeToggleStatus(category);
    }
  };

  const executeToggleStatus = async (category: any) => {
    const target = category || pendingCategory;
    if (!target) return;

    const updatedCategory = { ...target, isActive: !target.isActive };
    const actionText = updatedCategory.isActive ? 'Bật' : 'Tắt';
    try {
      await api.post('/admin/categories', updatedCategory);
      showToast(`${actionText} danh mục thành công.`, 'success');
      fetchData(cursors[currentPage - 1], currentPage);
    } catch (err) {
      console.error(err);
      showToast(`Không thể ${actionText.toLowerCase()} danh mục.`, 'error');
    } finally {
      setPendingCategory(null);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...categoryForm,
      ...(editingCategory ? { categoryId: editingCategory.categoryId } : {})
    };
    try {
      await api.post('/admin/categories', body);
      setCategoryModalOpen(false);
      showToast(editingCategory ? 'Cập nhật danh mục thành công.' : 'Thêm danh mục mới thành công.', 'success');
      fetchData(cursors[currentPage - 1], currentPage);
    } catch (error) {
      console.error("Error saving category:", error);
      showToast('Lỗi lưu danh mục hoặc kết nối máy chủ.', 'error');
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <AdminTableCard
        title="Quản lý danh mục"
        headerAction={
          <button className="btn-primary" onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ categoryName: '', description: '', isActive: true });
            setCategoryModalOpen(true);
          }}>
            <Plus /> Thêm danh mục
          </button>
        }
      >
        {/* Bộ lọc động */}
        <div className="admin-filter-bar">
          <div className="admin-filter-search-wrapper">
            <input
              type="text"
              placeholder="Tìm theo tên danh mục..."
              className="admin-filter-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="admin-filter-select-wrapper">
            <select
              className="admin-filter-select"
              value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
              onChange={e => {
                const val = e.target.value;
                setIsActiveFilter(val === 'all' ? undefined : val === 'active');
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang bật</option>
              <option value="inactive">Đang tắt</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="table-loading-cell">Đang tải danh sách danh mục...</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td className="table-empty-cell" colSpan={5}>Không tìm thấy danh mục nào.</td>
                  </tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.categoryId}>
                      <td>#{cat.categoryId}</td>
                      <td><strong>{cat.categoryName}</strong></td>
                      <td>{cat.description}</td>
                      <td>
                        <span className={`admin-badge ${cat.isActive ? 'success' : 'warning'}`}>
                          {cat.isActive ? 'Đang bật' : 'Đang tắt'}
                        </span>
                      </td>
                      <td className="admin-actions-cell">
                        <div className="admin-table-actions">
                          <button className="btn-admin-action edit" onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({ categoryName: cat.categoryName, description: cat.description, isActive: cat.isActive });
                            setCategoryModalOpen(true);
                          }}>Sửa</button>
                          <button className={`btn-admin-action ${cat.isActive ? 'lock' : 'edit'}`} onClick={() => handleToggleCategoryStatus(cat)}>
                            {cat.isActive ? 'Tắt' : 'Bật'}
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

      {categoryModalOpen && (
        <Portal>
          <div className="modal-overlay">
            <div className="modal-container animate-in">
              <div className="modal-header">
                <h3>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
                <button className="btn-close" onClick={() => setCategoryModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleSaveCategory} className="modal-body">
                <div className="form-group">
                  <label>Tên danh mục</label>
                  <input type="text" className="form-input" value={categoryForm.categoryName} onChange={e => setCategoryForm({ ...categoryForm, categoryName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea className="form-input" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={3}></textarea>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-view-account" onClick={() => setCategoryModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Lưu lại</button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      <AdminConfirmModal
        open={!!pendingCategory}
        variant="warning"
        title="Xác nhận tắt danh mục?"
        description={
          <>Bạn có chắc chắn muốn tắt danh mục <strong>{pendingCategory?.categoryName}</strong> không? Các sản phẩm thuộc danh mục này có thể không hiển thị đúng trên trang chủ.</>
        }
        confirmLabel="Xác nhận tắt"
        onConfirm={() => executeToggleStatus(pendingCategory)}
        onCancel={() => setPendingCategory(null)}
      />

      <AdminToast toast={toast} />
    </div>
  );
}
