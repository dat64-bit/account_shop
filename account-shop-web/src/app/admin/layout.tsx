"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user_info');
    if (!storedUserStr) {
      window.location.href = '/?error=login_required';
      return;
    }
    try {
      const storedUser = JSON.parse(storedUserStr);
      if (storedUser.role !== 'ROLE_ADMIN') {
        window.location.href = '/?error=unauthorized';
        return;
      }
      setChecking(false);
    } catch {
      window.location.href = '/?error=login_required';
    }
  }, []);

  if (checking) {
    return (
      <div className="page-loading-screen">
        <div className="page-loading-text">Đang xác thực quyền truy cập...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="dashboard-page admin-dashboard">
        <div className="container">
          <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-content">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
