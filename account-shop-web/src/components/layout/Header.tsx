"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

import CartDrawer from '@/components/cart/CartDrawer';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';

// SVG Components
const Search = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ShoppingCart = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LogOut = ({ size = 18, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

// Highlights Icons
const Trophy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22h10c0-1.76-.85-3.25-2.03-3.79-.5-.23-.97-.66-.97-1.21v-2.34c0-1.24.45-2.39 1.25-3.32.74-.87 1.35-1.92 1.35-3.12V4c0-1.1-.9-2-2-2H9.4c-1.1 0-2 .9-2 2v6.22c0 1.2.61 2.25 1.35 3.12.8.93 1.25 2.08 1.25 3.32z"></path></svg>
);
const DollarSign = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const Zap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const ShieldCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerCategories, setDrawerCategories] = useState<any[]>([]);
  const [drawerProducts, setDrawerProducts] = useState<any[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const handleToggleMobileMenu = async () => {
    setMobileMenuOpen(true);
    if (drawerCategories.length === 0) {
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/public/catalog/categories`);
        const prodRes = await fetch(`${API_BASE_URL}/api/public/catalog/products`);
        if (catRes.ok) setDrawerCategories(await catRes.json());
        if (prodRes.ok) setDrawerProducts(await prodRes.json());
      } catch (err) {
        console.error("Error fetching mobile menu data", err);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const highlights = [
    { icon: <Trophy />, title: 'CHẤT LƯỢNG HÀNG ĐẦU', sub: 'BẢO HÀNH TRỌN ĐỜI', color: 'var(--secondary)' },
    { icon: <DollarSign />, title: 'MỨC GIÁ CẠNH TRANH', sub: 'NHẬP KHẨU TRỰC TIẾP', color: 'var(--accent)' },
    { icon: <Zap />, title: 'GIAO HÀNG TỨC THỜI', sub: 'TỰ ĐỘNG SAU KHI THANH TOÁN', color: 'var(--secondary)' },
    { icon: <ShieldCheck />, title: 'BẢO MẬT TUYỆT ĐỐI', sub: 'MÃ HÓA THÔNG TIN', color: 'var(--primary)' },
  ];

  return (
    <>
      <header className={`header-wrapper ${scrolled ? 'scrolled' : ''}`}>
        {/* Top Bar */}
        <div className="container header-main">
          <Link href="/" className="logo logo-inner">
            <img src="/logo.png" alt="VanDatPremium Logo" className="logo-img" />
            <div className="logo-text-group">
              VanDat<span className="logo-sub">Premium</span>
            </div>
          </Link>

          <div className="search-bar">
            <input type="text" placeholder="Bạn đang cần tìm mua tài khoản gì?" />
            <button className="search-icon-btn" aria-label="Tìm kiếm">
              <Search size={18} />
            </button>
          </div>

          <div className="header-actions">

            {user ? (
              <>
                <div className="user-nav-group">
                  <Link href={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} className="user-greeting" title={user.role === 'ROLE_ADMIN' ? 'Vào trang quản trị' : 'Vào Dashboard cá nhân'}>
                    <UserIcon size={16} /> <span>{user.sub}</span>
                  </Link>
                  <Link href={user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard'} className="btn-primary sm">
                    {user.role === 'ROLE_ADMIN' ? 'Quản trị' : 'Dashboard'}
                  </Link>
                </div>
                <button className="btn-text logout-btn" onClick={logout}>
                  <LogOut size={15} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-text">Đăng nhập</Link>
                <Link href="/register" className="btn-primary">Đăng ký</Link>
              </>
            )}
            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={17} />
              Giỏ hàng
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Nav Bar */}
        <div className="nav-bar">
          <div className="container nav-content">
            <div className="category-header" onClick={handleToggleMobileMenu}>
              <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 18 }}>☰</span>
              DANH MỤC SẢN PHẨM
            </div>
            <div className="nav-highlights">
              {highlights.map((item, i) => (
                <div className="highlight-item" key={i}>
                  <div className="hi-icon-circle" style={{ backgroundColor: item.color }}>
                    {item.icon}
                  </div>
                  <span className="hi-text">
                    <span className="hi-title">{item.title}</span>
                    <span className="hi-sub">{item.sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>


      <CartDrawer />

      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Danh mục sản phẩm</h3>
              <button className="btn-close-drawer" onClick={() => setMobileMenuOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="drawer-content">
              {drawerCategories.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
              ) : (
                drawerCategories.map(cat => (
                  <div key={cat.categoryId} className="drawer-cat-item">
                    <div 
                      className={`drawer-cat-title ${expandedCat === cat.categoryName ? 'active' : ''}`}
                      onClick={() => setExpandedCat(expandedCat === cat.categoryName ? null : cat.categoryName)}
                    >
                      {cat.categoryName}
                      <span className="drawer-cat-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedCat === cat.categoryName ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                    {expandedCat === cat.categoryName && (
                      <div className="drawer-cat-products animate-in slide-in-from-top-2">
                        {drawerProducts.filter(p => p.categoryName === cat.categoryName).length > 0 ? (
                          drawerProducts.filter(p => p.categoryName === cat.categoryName).map(p => (
                            <Link href={`/products/${p.productId}`} key={p.productId} className="drawer-product-link" onClick={() => setMobileMenuOpen(false)}>
                              <span className="dot"></span> {p.productName}
                            </Link>
                          ))
                        ) : (
                          <div className="drawer-empty-products">Chưa có sản phẩm</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
