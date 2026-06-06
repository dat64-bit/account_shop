"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/common/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { useAdminToast } from '@/components/admin/AdminToast';
import { AdminPagination } from '@/components/admin/AdminPagination';
import AdminTable from '@/components/admin/AdminTable';
import api from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeysetPagination } from '@/hooks/useKeysetPagination';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19">
    </line>
    <line x1="5" y1="12" x2="19" y2="12">
    </line>
  </svg>
);

export const getCategoryColumns = (
  onEdit: (cat: any) => void,
  onToggleStatus: (cat: any) => void
) => [
    {
      title: 'ID',
      dataIndex: 'categoryId',
      render: (id: any) => `#${id}`
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'categoryName',
      render: (name: any) => <strong>{name}</strong>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (isActive: any) => (
        <span className={`admin-badge ${isActive ? 'success' : 'warning'}`}>
          {isActive ? 'Đang bật' : 'Đang tắt'}
        </span>
      )
    },
    {
      title: 'Thao tác',
      dataIndex: 'actions',
      render: (_: any, cat: any) => (
        <div className="admin-table-actions">
          <button className="btn-admin-action edit" onClick={() => onEdit(cat)}>Sửa</button>
          <button className={`btn-admin-action ${cat.isActive ? 'lock' : 'edit'}`} onClick={() => onToggleStatus(cat)}>
            {cat.isActive ? 'Tắt' : 'Bật'}
          </button>
        </div>
      )
    }
  ];

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
  const { showToast } = useAdminToast();
  const [pendingCategory, setPendingCategory] = useState<any>(null);

  // Filters & Keyset Pagination States
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 1000);

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

  const {
    currentPage,
    setCurrentPage,
    hasMore,
    setHasMore,
    cursors,
    handlePrev,
    handleNext,
    resetPagination
  } = useKeysetPagination(fetchData, (cat: any) => cat.categoryId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (isMounted) {
      resetPagination();
      fetchData(null, 1);
    }
  }, [isActiveFilter, debouncedKeyword, isMounted]);

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

  const handleSaveCategory = async (e: React.SyntheticEvent<HTMLFormElement, Event>) => {
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

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({ categoryName: cat.categoryName, description: cat.description, isActive: cat.isActive });
    setCategoryModalOpen(true);
  };

  const columns = getCategoryColumns(handleEditCategory, handleToggleCategoryStatus);

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
            <AdminTable 
              columns={columns} 
              data={categories} 
              rowKey="categoryId" 
              emptyText="Không tìm thấy danh mục nào." 
            />
            <AdminPagination
              currentPage={currentPage}
              hasMore={hasMore}
              onPrev={handlePrev}
              onNext={() => handleNext(categories)}
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
    </div>
  );
}
