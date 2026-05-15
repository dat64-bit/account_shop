"use client";

import { useState } from 'react';

interface Category {
  categoryId: number;
  categoryName: string;
}

interface Product {
  productId: number;
  productName: string;
  categoryName: string;
}

// SVG Components for Sidebar
const Film = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
);
const Music = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
);
const ShieldCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);
const GraduationCap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
);
const Gamepad2 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><circle cx="15" cy="13" r="1"></circle><circle cx="18" cy="11" r="1"></circle><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
);
const HardDrive = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12"></line><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path><line x1="6" y1="16" x2="6.01" y2="16"></line><line x1="10" y1="16" x2="10.01" y2="16"></line></svg>
);
const Palette = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.72 1.7-1.6 0-.41-.17-.79-.44-1.07-.27-.28-.44-.67-.44-1.1 0-.88.72-1.6 1.6-1.6H17c2.8 0 5-2.2 5-5 0-4.4-4.5-8-10-8z"></path></svg>
);

const CAT_ICONS_MAP: Record<string, React.ReactNode> = {
  'Phim Ảnh': <Film />,
  'Âm nhạc': <Music />,
  'VPN': <ShieldCheck />,
  'Học tập': <GraduationCap />,
  'Game': <Gamepad2 />,
  'Lưu trữ': <HardDrive />,
  'Thiết kế': <Palette />,
};

// SVG Components common
const ChevronRight = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const ImageIcon = ({ size = 48, strokeWidth = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

export default function Hero({ categories, products, loading }: { categories: Category[], products: Product[], loading: boolean }) {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const fallback = [
    { categoryId: 1, categoryName: 'Phim Ảnh' },
    { categoryId: 2, categoryName: 'Âm nhạc' },
    { categoryId: 3, categoryName: 'VPN' },
    { categoryId: 4, categoryName: 'Học tập' },
    { categoryId: 5, categoryName: 'Game' },
    { categoryId: 6, categoryName: 'Lưu trữ' },
    { categoryId: 7, categoryName: 'Thiết kế' },
  ];
  const list = categories.length > 0 ? categories : fallback;

  // Lọc sản phẩm theo category đang hover
  const filteredProducts = products.filter(p => p.categoryName === hoveredCat);

  return (
    <div className="hero-section animate-in">
      {/* Left: Sidebar Menu */}
      <aside className="sidebar-menu" onMouseLeave={() => setHoveredCat(null)}>
        <ul className="category-list">
          {loading ? (
            <li style={{ color: '#94a3b8', justifyContent: 'center' }}>Đang tải...</li>
          ) : list.map(c => (
            <li 
              key={c.categoryId} 
              onMouseEnter={() => setHoveredCat(c.categoryName)}
              className={hoveredCat === c.categoryName ? 'active' : ''}
            >
              <span className="cat-icon-container">
                {CAT_ICONS_MAP[c.categoryName] ?? <span className="cat-icon-default">📦</span>}
              </span>
              {c.categoryName}
              <ChevronRight size={14} className="cat-arrow" />
            </li>
          ))}
        </ul>

        {/* Submenu (Flyout) */}
        {hoveredCat && (
          <div className="sidebar-submenu animate-fade-in">
            <h3 className="submenu-title">Sản phẩm {hoveredCat}</h3>
            <div className="submenu-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(p => (
                  <div key={p.productId} className="submenu-item">
                    <span className="submenu-dot"></span>
                    {p.productName}
                  </div>
                ))
              ) : (
                <div className="submenu-empty">Chưa có sản phẩm trong danh mục này</div>
              )}
            </div>
            <div className="submenu-footer">
              Xem tất cả sản phẩm {hoveredCat} →
            </div>
          </div>
        )}
      </aside>

      {/* Center: Main Banner */}
      <div className="main-banner">
        <div className="banner-content">
          <h2>VanDatPremium</h2>
          <p>Hệ thống cung cấp tài khoản số uy tín, giá rẻ & bảo hành trọn đời.</p>
          <button className="btn-banner">Mua sắm ngay</button>
        </div>
      </div>

      {/* Right: Side Banners */}
      <div className="side-banners">
        <div className="side-banner" style={{ background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=300&h=165") center/cover' }}>
          <span style={{ color: 'white', fontWeight: 700 }}>Netflix Premium</span>
          <span style={{ fontSize: 11, color: '#fbbf24' }}>Chỉ từ 45k/tháng</span>
        </div>
        <div className="side-banner" style={{ background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1614680376593-902f74cc0d41?auto=format&fit=crop&q=80&w=300&h=165") center/cover' }}>
          <span style={{ color: 'white', fontWeight: 700 }}>Spotify Family</span>
          <span style={{ fontSize: 11, color: '#fbbf24' }}>Gói 1 năm giá cực sốc</span>
        </div>
      </div>
    </div>
  );
}
