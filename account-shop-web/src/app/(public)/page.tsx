"use client";

import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import ProductCard from '@/components/common/ProductCard';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';
import { useAdminToast } from '@/components/admin/AdminToast';

interface Category { categoryId: number; categoryName: string; description: string; }
interface Product { productId: number; productName: string; categoryName: string; imageUrl?: string; startingPrice?: number; }

// SVG Components
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const Package = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.6"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAdminToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      if (error) {
        if (error === 'unauthorized') {
          showToast("Bạn không có quyền truy cập tính năng này!", "error");
        } else if (error === 'login_required') {
          showToast("Vui lòng đăng nhập để sử dụng tính năng này!", "error");
        }
        // Xóa tham số khỏi URL mà không reload trang
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      // Đảm bảo trạng thái loading được bật khi bắt đầu fetch
      setLoading(true);

      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/public/catalog/categories`, {
            signal: controller.signal,
            cache: 'no-cache'
          }),
          fetch(`${API_BASE_URL}/api/public/catalog/products`, {
            signal: controller.signal,
            cache: 'no-cache'
          }),
        ]);

        if (!isMounted) return;

        const [catData, prodData] = await Promise.all([
          catRes.ok ? catRes.json() : Promise.resolve([]),
          prodRes.ok ? prodRes.json() : Promise.resolve([]),
        ]);

        if (isMounted) {
          setCategories(catData);
          setProducts(prodData);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Home fetch error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <>
      <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 40 }}>
        <div className="container" style={{ paddingTop: 16 }}>
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <a href="/">Trang chủ</a>
          </nav>

          {/* Hero */}
          <Hero categories={categories} products={products} loading={loading} />

          {/* Product Section */}
          <section>
            <div className="section-header" style={{ marginTop: 40 }}>
              <h2 className="section-title">
                <Package size={20} /> Sản phẩm nổi bật
              </h2>
              <span className="section-link">
                Xem tất cả <ChevronRight />
              </span>
            </div>

            <div className="product-grid">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="product-card">
                    <div className="product-card-image animate-shimmer" />
                    <div className="product-card-body">
                      <div className="animate-shimmer" style={{ height: 12, width: '40%', borderRadius: 4 }} />
                      <div className="animate-shimmer" style={{ height: 16, width: '90%', borderRadius: 4 }} />
                      <div className="animate-shimmer" style={{ height: 20, width: '50%', borderRadius: 4, marginTop: 10 }} />
                    </div>
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map(p => (
                  <ProductCard 
                    key={p.productId}
                    productId={p.productId}
                    productName={p.productName}
                    categoryName={p.categoryName}
                    imageUrl={p.imageUrl}
                    startingPrice={p.startingPrice}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-white)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <Package size={48} />
                  <h3 style={{ marginTop: 16, color: 'var(--text-main)' }}>Chưa có sản phẩm nào</h3>
                  <p style={{ marginTop: 8 }}>Vui lòng quay lại sau hoặc liên hệ hỗ trợ.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
