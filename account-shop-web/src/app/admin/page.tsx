"use client";

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/config';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// Icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.27 6.96 8.73 5.05 8.73-5.05"></path><path d="M12 22.08V12"></path></svg>
);
const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
);
const DollarSign = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

const lineChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: { grid: { color: '#f1f5f9', borderDash: [4, 4] as number[] }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: '#f1f5f9', borderDash: [4, 4] as number[] }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
  },
};

const miniOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } },
};

const topProductsOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const, labels: { usePointStyle: true, pointStyle: 'circle', font: { size: 12 }, color: '#475569' } },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: '#f1f5f9', borderDash: [4, 4] as number[] }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true, max: 100 },
  },
};

export default function AdminOverview() {
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalUsers: 0,
    totalOrdersToday: 0,
    pendingTickets: 0,
    revenueTrend: [],
    orderTrend: [],
    topProductNames: [],
    topProductSales: [],
    topProductPreviousSales: []
  });
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (error) {
      console.error("Fetch Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) return null;
  if (loading) return <div className="animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="animate-in">
      {/* Nhóm 4 Mini Stat Cards chính */}
      <div className="admin-mini-cards">
        {/* Card 1: Doanh thu */}
        <div className="content-card mini-stat-card">
          <div className="mini-stat-header">
            <div>
              <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#0369a1' }}><DollarSign /></span> Tổng doanh thu
              </span>
              <div className="mini-stat-value">{stats.totalRevenue?.toLocaleString()}đ</div>
              <span className="mini-stat-badge positive">+12.5%</span>
            </div>
            <div style={{ width: 80, height: 50 }}>
              <Line
                data={{
                  labels: ['', '', '', '', '', '', ''],
                  datasets: [{ data: stats.revenueTrend || [], borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', tension: 0.5, pointRadius: 0, fill: true }]
                }}
                options={miniOptions}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Người dùng */}
        <div className="content-card mini-stat-card">
          <div className="mini-stat-header">
            <div>
              <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#166534' }}><UsersIcon /></span> Người dùng
              </span>
              <div className="mini-stat-value">{stats.totalUsers}</div>
              <span className="mini-stat-badge positive">+2.4%</span>
            </div>
            <div style={{ width: 80, height: 50 }}>
              <Bar
                data={{
                  labels: ['', '', '', '', '', '', ''],
                  datasets: [{ data: stats.orderTrend || [], backgroundColor: '#bfdbfe', borderRadius: 3, barPercentage: 0.6 }]
                }}
                options={miniOptions}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Đơn hàng hôm nay */}
        <div className="content-card mini-stat-card">
          <div className="mini-stat-header">
            <div>
              <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#92400e' }}><PackageIcon /></span> Đơn hôm nay
              </span>
              <div className="mini-stat-value">{stats.totalOrdersToday}</div>
              <span className="mini-stat-badge positive">Mới</span>
            </div>
            <div style={{ width: 80, height: 50 }}>
              <Line
                data={{
                  labels: ['', '', '', '', '', '', ''],
                  datasets: [{ data: stats.orderTrend || [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.5, pointRadius: 0, fill: true }]
                }}
                options={miniOptions}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Ticket chờ */}
        <div className="content-card mini-stat-card">
          <div className="mini-stat-header">
            <div>
              <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#991b1b' }}><TicketIcon /></span> Ticket chờ
              </span>
              <div className="mini-stat-value">{stats.pendingTickets}</div>
              <span className={`mini-stat-badge ${stats.pendingTickets > 0 ? 'negative' : 'positive'}`}>
                {stats.pendingTickets > 0 ? 'Cần xử lý' : 'Ổn định'}
              </span>
            </div>
            <div style={{ width: 80, height: 50 }}>
              <Bar
                data={{
                  labels: ['', '', '', '', '', '', ''],
                  datasets: [{ data: [10, 20, 15, 30, 25, 40, stats.pendingTickets], backgroundColor: '#fca5a5', borderRadius: 3, barPercentage: 0.6 }]
                }}
                options={miniOptions}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ chính ở dưới */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h2 className="card-title">Tổng doanh số</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="chart-month-select">
              <option>Tháng hiện tại</option>
            </select>
          </div>
        </div>
        <div style={{ padding: '8px 20px 20px', height: 280 }}>
          <Line
            data={{
              labels: ['6 ngày trước', '5 ngày trước', '4 ngày trước', '3 ngày trước', '2 ngày trước', '1 ngày trước', 'Hôm nay'],
              datasets: [{
                data: stats.revenueTrend || [],
                fill: true,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.08)',
                tension: 0.45,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2563eb',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
              }]
            }}
            options={lineChartOptions}
          />
        </div>
      </div>

      {/* Row 4: Top Products bar chart */}
      <div className="content-card mt-6">
        <div className="card-header">
          <h2 className="card-title">Sản phẩm bán chạy</h2>
          <Link href="/admin/products" className="btn-link-blue">Xem chi tiết →</Link>
        </div>
        <div style={{ padding: '8px 20px 20px', height: 280 }}>
          <Bar
            data={{
              labels: stats.topProductNames || [],
              datasets: [
                { label: 'Tháng này', data: stats.topProductSales || [], backgroundColor: '#2563eb', borderRadius: 4, barPercentage: 0.45 },
                { label: 'Tháng trước', data: stats.topProductPreviousSales || [], backgroundColor: '#bfdbfe', borderRadius: 4, barPercentage: 0.45 },
              ]
            }}
            options={topProductsOptions}
          />
        </div>
      </div>
    </div>
  );
}
