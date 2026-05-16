"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
