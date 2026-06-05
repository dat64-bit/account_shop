"use client";


import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CustomerSidebar from '@/components/customer/Sidebar';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <>
      <Header />
      <main className="dashboard-page">
        <div className="container">
          <div className="dashboard-layout">
            <CustomerSidebar />
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
