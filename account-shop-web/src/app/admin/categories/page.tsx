"use client";

import { useState, useEffect } from 'react';
import Portal from '@/components/Portal';
import { AdminTableCard } from '@/components/admin/AdminTableCard';

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const catRes = await fetch('http://localhost:8080/api/admin/categories', { headers });
      if (catRes.ok) setCategories(await catRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const handleToggleCategoryStatus = async (category: any) => {
    const token = localStorage.getItem('token');
    const updatedCategory = { ...category, isActive: !category.isActive };
    try {
      const res = await fetch('http://localhost:8080/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedCategory)
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        setCategoryModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải...</div>;

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
            {categories.map(cat => (
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
                  <button className="btn-admin-action edit" onClick={() => {
                    setEditingCategory(cat);
                    setCategoryForm({ categoryName: cat.categoryName, description: cat.description, isActive: cat.isActive });
                    setCategoryModalOpen(true);
                  }}>Sửa</button>
                  <button className={`btn-admin-action ${cat.isActive ? 'lock' : 'edit'}`} onClick={() => handleToggleCategoryStatus(cat)}>
                    {cat.isActive ? 'Tắt' : 'Bật'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
}
