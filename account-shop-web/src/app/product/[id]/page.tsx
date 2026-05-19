"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Product {
  productId: number;
  productName: string;
  categoryName: string;
  description: string;
  imageUrl?: string;
}

// SVG Components
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const Package = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.6"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const ShieldCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
const Zap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('desc');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/public/catalog/products/${id}`);
        if (res.ok) {
          setProduct(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="loading-screen">Đang tải chi tiết sản phẩm...</div>;

  const p: Product = product || {
    productId: Number(id),
    productName: 'Sản phẩm mẫu',
    categoryName: 'Danh mục',
    description: 'Mô tả sản phẩm đang được cập nhật. Đây là bản xem trước giao diện.',
    imageUrl: ''
  };

  return (
    <>
      <Header />
      <main className="product-detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <a href="#">{p.categoryName}</a>
            <span>/</span>
            <span className="current">{p.productName}</span>
          </nav>

          <div className="product-main-grid">
            {/* Left: Image Gallery */}
            <div className="product-gallery">
              <div className="main-image" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                {p.imageUrl ? (
                  <img 
                    src={p.imageUrl} 
                    alt={p.productName} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '350px' }} 
                  />
                ) : (
                  <>
                    <Package size={80} />
                    <span>Ảnh sản phẩm {p.productName}</span>
                  </>
                )}
              </div>
              <div className="thumbnail-list">
                <div className="thumb active" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={20} />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Info */}
            <div className="product-info-panel">
              <div className="info-cat">{p.categoryName}</div>
              <h1 className="info-title">{p.productName}</h1>

              <div className="info-meta">
                <div className="meta-item">Mã SP: <strong>#VD{id}</strong></div>
                <div className="meta-item status-in-stock">Trạng thái: <strong>Còn hàng</strong></div>
              </div>

              <div className="info-price">
                <span className="price-current">Liên hệ</span>
                <span className="price-tag">Giá tốt nhất thị trường</span>
              </div>

              <div className="info-actions">
                <button className="btn-buy-now">MUA NGAY</button>
                <button className="btn-add-cart">THÊM VÀO GIỎ</button>
              </div>

              <div className="info-benefits">
                <div className="benefit-item">
                  <ShieldCheck />
                  <div>
                    <strong>Bảo hành trọn đời</strong>
                    <p>Cam kết 1 đổi 1 nếu có lỗi từ nhà sản xuất</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <Zap />
                  <div>
                    <strong>Giao hàng tức thì</strong>
                    <p>Hệ thống tự động gửi tài khoản sau 1s thanh toán</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Tabs */}
          <div className="product-tabs">
            <div className="tab-header">
              <button
                className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
                onClick={() => setActiveTab('desc')}
              >
                Mô tả sản phẩm
              </button>
              <button
                className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
                onClick={() => setActiveTab('guide')}
              >
                Hướng dẫn sử dụng
              </button>
              <button
                className={`tab-btn ${activeTab === 'review' ? 'active' : ''}`}
                onClick={() => setActiveTab('review')}
              >
                Đánh giá
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'desc' && (
                <div className="animate-fade-in">
                  <h3>Chi tiết về {p.productName}</h3>
                  <p>{p.description}</p>
                  <ul style={{ marginTop: 20 }}>
                    <li>Thời gian sử dụng: Tùy chọn (1 tháng, 6 tháng, 1 năm)</li>
                    <li>Nền tảng hỗ trợ: Mobile, PC, Tablet, Smart TV</li>
                    <li>Hỗ trợ khách hàng: 24/7 qua Zalo/Facebook</li>
                  </ul>
                </div>
              )}

              {activeTab === 'guide' && (
                <div className="animate-fade-in">
                  <h3>Hướng dẫn sử dụng {p.productName}</h3>
                  <div className="guide-steps">
                    <p><strong>Bước 1:</strong> Đăng nhập vào tài khoản được gửi qua Email/Lịch sử đơn hàng.</p>
                    <p><strong>Bước 2:</strong> Không thay đổi thông tin Profile (nếu là Profile dùng chung).</p>
                    <p><strong>Bước 3:</strong> Tận hưởng nội dung chất lượng cao!</p>
                    <p style={{ marginTop: 15, color: '#ef4444' }}>* Lưu ý: Không chia sẻ tài khoản cho người khác để tránh bị khóa.</p>
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div className="animate-fade-in">
                  <h3>Đánh giá từ khách hàng</h3>
                  <div className="reviews-placeholder">
                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
