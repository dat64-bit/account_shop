"use client";


import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/admin/AdminSidebar';

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
