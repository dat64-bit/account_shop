"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import api from '@/lib/axios';

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const ShoppingBag = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
);
const Clock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const MessageSquare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const CreditCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);

export default function CustomerSidebar() {
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user_info');
    if (storedUserStr) {
      try {
        setUserInfo(JSON.parse(storedUserStr));
      } catch {}
    }

    api.get('/auth/me').then(res => {
      if (res.data) {
        setBalance(res.data.balance ?? null);
      }
    }).catch(() => {});
  }, []);

  return (
    <aside className="dashboard-sidebar">
      <div className="user-profile-card">
        <div className="user-avatar">
          <UserIcon />
        </div>
        <div className="user-info">
          <span className="user-name">{userInfo?.sub || 'Người dùng'}</span>
          <span className="user-email">{userInfo?.email || ''}</span>
        </div>
      </div>

      <nav className="dashboard-nav">
        <Link
          href="/dashboard"
          className={pathname === '/dashboard' ? 'active' : ''}
          style={{ textDecoration: 'none' }}
        >
          <ShoppingBag /> Tổng quan
        </Link>
        <Link
          href="/orders"
          className={pathname === '/orders' ? 'active' : ''}
          style={{ textDecoration: 'none' }}
        >
          <Clock /> Lịch sử mua hàng
        </Link>
        <Link
          href="/transactions"
          className={pathname === '/transactions' ? 'active' : ''}
          style={{ textDecoration: 'none' }}
        >
          <CreditCard /> Lịch sử giao dịch
        </Link>
        <Link
          href="/profile"
          className={pathname === '/profile' ? 'active' : ''}
          style={{ textDecoration: 'none' }}
        >
          <UserIcon /> Thông tin cá nhân
        </Link>
        <Link
          href="/tickets"
          className={pathname === '/tickets' ? 'active' : ''}
          style={{ textDecoration: 'none' }}
        >
          <MessageSquare /> Hỗ trợ / Ticket
        </Link>
      </nav>

      <div className="sidebar-balance">
        <span>Số dư tài khoản:</span>
        <strong className="balance-amount">{balance != null ? balance.toLocaleString() + 'đ' : 'Đang cập nhật...'}</strong>
        <Link href="/deposit" className="btn-deposit" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>Nạp tiền ngay</Link>
      </div>
    </aside>
  );
}
