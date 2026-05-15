"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// --- Chart Data ---
const totalSalesData = {
  labels: ['Jan 5', 'Jan 7', 'Jan 9', 'Jan 11', 'Jan 13', 'Jan 15'],
  datasets: [{
    data: [60, 80, 65, 130, 30, 68],
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
};

const lineChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: { grid: { color: '#f1f5f9', borderDash: [4, 4] as number[] }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: '#f1f5f9', borderDash: [4, 4] as number[] }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
  },
};

const miniOrdersData = {
  labels: ['', '', '', '', ''],
  datasets: [{
    data: [20, 45, 30, 80, 60],
    fill: true,
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37,99,235,0.1)',
    tension: 0.5,
    pointRadius: 0,
  }]
};

const miniSalesData = {
  labels: ['', '', '', '', '', '', ''],
  datasets: [
    { data: [30, 55, 40, 70, 50, 80, 60], backgroundColor: '#2563eb', borderRadius: 3, barPercentage: 0.5 },
    { data: [20, 35, 28, 50, 35, 60, 40], backgroundColor: '#bfdbfe', borderRadius: 3, barPercentage: 0.5 },
  ]
};

const miniOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: { x: { display: false }, y: { display: false } },
};

const doughnutData = {
  datasets: [{
    data: [60, 25, 15],
    backgroundColor: ['#2563eb', '#38bdf8', '#e2e8f0'],
    borderWidth: 0,
    cutout: '78%',
  }]
};

const topProductsData = {
  labels: ['Netflix', 'Spotify', 'YouTube', 'ChatGPT', 'Canva', 'Adobe'],
  datasets: [
    { label: 'Tháng này', data: [65, 80, 83, 70, 78, 48, 78], backgroundColor: '#2563eb', borderRadius: 4, barPercentage: 0.45 },
    { label: 'Tháng trước', data: [82, 70, 62, 52, 48, 68, 88], backgroundColor: '#bfdbfe', borderRadius: 4, barPercentage: 0.45 },
  ]
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

// Icons
const LayoutDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
);
const Users = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const Package = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.27 6.96 8.73 5.05 8.73-5.05"></path><path d="M12 22.08V12"></path></svg>
);
const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
);
const DollarSign = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const Bell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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
  const [lastTicketCount, setLastTicketCount] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product CRUD
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    productName: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    isContactSeller: false,
    isInputEmailRequired: false,
    productStatusId: 1
  });

  // Ticket Chat
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [adminReply, setAdminReply] = useState('');

  // Inventory & Category CRUD
  const [inventory, setInventory] = useState<any[]>([]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    categoryName: '',
    description: '',
    isActive: true
  });

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Dashboard Stats
      const prodRes = await fetch('http://localhost:8080/api/admin/dashboard', { headers });
      if (prodRes.ok) setStats(await prodRes.json());

      const catRes = await fetch('http://localhost:8080/api/admin/categories', { headers });
      if (catRes.ok) setCategories(await catRes.json());

      const usersRes = await fetch('http://localhost:8080/api/admin/users', { headers });
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Fetch Tickets
      const ticketsRes = await fetch('http://localhost:8080/api/admin/tickets', { headers });
      const ticketsData = await ticketsRes.json();
      setTickets(ticketsData);

      // Fetch Products
      const productsRes = await fetch('http://localhost:8080/api/public/catalog/products');
      const productsData = await productsRes.json();
      setProducts(productsData);

      // Thông báo nếu có ticket mới
      if (stats.pendingTickets > lastTicketCount && lastTicketCount > 0) {
        // Phát âm thanh Ping
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Audio play blocked by browser"));

        alert(`🔔 Bạn có ${stats.pendingTickets - lastTicketCount} yêu cầu hỗ trợ mới!`);
      }
      setLastTicketCount(stats.pendingTickets);

    } catch (error) {
      console.error("Admin Access Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/admin/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInventory(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') fetchInventory();
  }, [activeTab]);

  const fetchTicketReplies = async (ticketId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/v1/tickets/${ticketId}/replies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTicketReplies(data);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleOpenTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    fetchTicketReplies(ticket.ticketId);
  };

  const handleEditProduct = (p: any) => {
    setEditingProduct(p);
    setProductForm({
      productName: p.productName,
      categoryId: p.categoryId || (categories[0]?.categoryId || ''),
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      isContactSeller: p.isContactSeller || false,
      isInputEmailRequired: p.isInputEmailRequired || false,
      productStatusId: p.productStatusId || 1
    });
    setProductModalOpen(true);
  };

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      productName: '',
      categoryId: categories[0]?.categoryId || '',
      description: '',
      imageUrl: '',
      isContactSeller: false,
      isInputEmailRequired: false,
      productStatusId: 1
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingProduct
      ? `http://localhost:8080/api/admin/products/${editingProduct.productId}`
      : 'http://localhost:8080/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      if (res.ok) {
        setProductModalOpen(false);
        fetchAdminData();
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const toggleProductStatus = async (id: number, currentStatus: number) => {
    const token = localStorage.getItem('token');
    const newStatus = currentStatus === 1 ? 2 : 1;
    try {
      await fetch(`http://localhost:8080/api/admin/products/${id}/status?statusId=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async () => {
    if (!adminReply.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/v1/tickets/${selectedTicket.ticketId}/replies`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: adminReply })
      });
      if (res.ok) {
        setAdminReply('');
        handleOpenTicket(selectedTicket);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  const handleResolveTicket = async (newStatus: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/admin/tickets/${selectedTicket.ticketId}/status?statusId=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedTicket(null);
        fetchAdminData();
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, [lastTicketCount]);

  const handleToggleUserStatus = async (userId: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 2 : 1;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/status?statusId=${newStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchAdminData();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8080/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });
      if (res.ok) {
        setCategoryModalOpen(false);
        fetchAdminData();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDeleteInventory = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này khỏi kho?")) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/admin/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Header />
      <main className="dashboard-page admin-dashboard">
        <div className="container">
          <div className="dashboard-layout">

            {/* Sidebar Admin */}
            <aside className="dashboard-sidebar">
              <div className="admin-badge">
                <span className="badge-text">QUẢN TRỊ VIÊN</span>
              </div>
              <nav className="dashboard-nav">
                <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                  <LayoutDashboard /> Tổng quan
                </button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
                  <Users /> Người dùng
                </button>
                <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                  <Package /> Sản phẩm
                </button>
                <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>
                  <LayoutDashboard /> Kho hàng
                </button>
                <button className={activeTab === 'tickets' ? 'active' : ''} onClick={() => setActiveTab('tickets')}>
                  <TicketIcon /> Hỗ trợ
                  {stats.pendingTickets > 0 && <span className="nav-badge-red">{stats.pendingTickets}</span>}
                </button>
              </nav>
            </aside>

            {/* Nội dung chính */}
            <div className="dashboard-content">
              {activeTab === 'overview' && (
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
                            <span style={{ color: '#166534' }}><Users /></span> Người dùng
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
                            <span style={{ color: '#92400e' }}><Package /></span> Đơn hôm nay
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
                      <button className="btn-link-blue" onClick={() => setActiveTab('products')}>Xem chi tiết →</button>
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
              )}

              {activeTab === 'users' && (
                <div className="content-card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">Quản lý người dùng</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên đăng nhập</th>
                          <th>Họ tên</th>
                          <th>Số dư</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.accountId}>
                            <td>#{user.accountId}</td>
                            <td><strong>{user.username}</strong></td>
                            <td>{user.fullName}</td>
                            <td>{user.balance?.toLocaleString()}đ</td>
                            <td>
                              <span className={`status-badge ${user.accountStatusId === 1 ? 'completed' : 'open'}`}>
                                {user.accountStatusId === 1 ? 'Hoạt động' : 'Đã khóa'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-view-account">Sửa</button>
                                <button
                                  className={`btn-view-account ${user.accountStatusId === 1 ? 'btn-lock' : 'btn-unlock'}`}
                                  onClick={() => handleToggleUserStatus(user.accountId, user.accountStatusId)}
                                >
                                  {user.accountStatusId === 1 ? 'Khóa' : 'Mở'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="content-card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">Danh sách sản phẩm</h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-view-account" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => setCategoryModalOpen(true)}><Plus /> Thêm danh mục</button>
                      <button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }} onClick={handleAddNewProduct}><Plus /> Thêm sản phẩm</button>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Hình ảnh</th>
                          <th>Tên sản phẩm</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.productId}>
                            <td>#{p.productId}</td>
                            <td><img src={p.imageUrl} alt={p.productName} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} /></td>
                            <td><strong>{p.productName}</strong></td>
                            <td>
                              <span className={`status-badge ${p.productStatusId === 1 ? 'completed' : 'open'}`}>
                                {p.productStatusId === 1 ? 'Kinh doanh' : 'Ngừng bán'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn-view-account" onClick={() => handleEditProduct(p)}>Chỉnh sửa</button>
                                <button className="btn-view-account" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={() => toggleProductStatus(p.productId, p.productStatusId)}>
                                  {p.productStatusId === 1 ? 'Ngừng bán' : 'Bán lại'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="content-card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">Quản lý Kho hàng</h2>
                    <button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}><Plus /> Nhập kho</button>
                  </div>
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Sản phẩm</th>
                          <th>Email/Username</th>
                          <th>Mật khẩu</th>
                          <th>Trạng thái</th>
                          <th>Ngày nhập</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map(item => (
                          <tr key={item.accountItemId}>
                            <td>#{item.accountItemId}</td>
                            <td><strong>{item.productName}</strong></td>
                            <td>{item.accountEmail}</td>
                            <td><code>{item.accountPassword}</code></td>
                            <td>
                              <span className={`status-badge ${item.itemStatusId === 1 ? 'completed' : item.itemStatusId === 2 ? 'pending' : 'resolved'}`}>
                                {item.statusName}
                              </span>
                            </td>
                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button className="btn-view-account" style={{ color: '#ef4444' }} onClick={() => handleDeleteInventory(item.accountItemId)}>Xóa</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="content-card animate-in">
                  <div className="card-header">
                    <h2 className="card-title">Danh sách Ticket hỗ trợ</h2>
                  </div>
                  <div className="table-responsive">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Mã</th>
                          <th>Chủ đề</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map(t => (
                          <tr key={t.ticketId}>
                            <td>#{t.ticketId}</td>
                            <td><strong>{t.issueType}</strong></td>
                            <td>
                              <span className={`status-badge ${t.ticketStatusId === 1 ? 'open' : t.ticketStatusId === 2 ? 'resolved' : 'pending'}`}>
                                {t.ticketStatusId === 1 ? 'Chờ xử lý' : t.ticketStatusId === 2 ? 'Đã xong' : 'Đang xử lý'}
                              </span>
                            </td>
                            <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td>
                              <button className="btn-view-account" style={{ color: '#2563eb' }} onClick={() => handleOpenTicket(t)}>Xử lý ngay</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Xử lý Ticket */}
        {selectedTicket && (
          <div className="modal-overlay">
            <div className="modal-container admin-ticket-modal animate-in">
              <div className="modal-header">
                <h3>Xử lý Ticket #{selectedTicket.ticketId}</h3>
                <button className="btn-close" onClick={() => setSelectedTicket(null)}>&times;</button>
              </div>
              <div className="modal-body admin-chat-body">
                <div className="ticket-info-summary">
                  <p><strong>Loại:</strong> {selectedTicket.issueType}</p>
                </div>

                <div className="chat-messages">
                  {ticketReplies.map((reply, idx) => (
                    <div key={idx} className={`chat-bubble ${reply.isAdmin ? 'admin' : 'user'}`}>
                      <div className="bubble-content">{reply.message}</div>
                      <div className="bubble-time">{new Date(reply.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-area">
                  <textarea
                    placeholder="Nhập nội dung phản hồi khách hàng..."
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                  ></textarea>
                  <div className="chat-actions">
                    <button className="btn-resolve" onClick={() => handleResolveTicket(2)}>Đánh dấu: Đã xong</button>
                    <button className="btn-send-reply" onClick={handleSendReply}>Gửi phản hồi</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Thêm/Sửa Sản phẩm */}
        {productModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container animate-in" style={{ maxWidth: 500 }}>
              <div className="modal-header">
                <h3>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                <button className="btn-close" onClick={() => setProductModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleSaveProduct} className="modal-body">
                <div className="form-group">
                  <label>Tên sản phẩm</label>
                  <input type="text" value={productForm.productName} onChange={e => setProductForm({ ...productForm, productName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select value={productForm.categoryId} onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })} required>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={3} />
                </div>
                <div className="form-group">
                  <label>URL Hình ảnh</label>
                  <input type="text" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
                </div>
                <div className="form-checkbox-group" style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input type="checkbox" checked={productForm.isContactSeller} onChange={e => setProductForm({ ...productForm, isContactSeller: e.target.checked })} />
                    Liên hệ người bán
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input type="checkbox" checked={productForm.isInputEmailRequired} onChange={e => setProductForm({ ...productForm, isInputEmailRequired: e.target.checked })} />
                    Yêu cầu Email
                  </label>
                </div>
                <div className="modal-footer" style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn-cancel" onClick={() => setProductModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal Thêm Danh mục */}
        {categoryModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container animate-in" style={{ maxWidth: 400 }}>
              <div className="modal-header">
                <h3>Thêm danh mục mới</h3>
                <button className="btn-close" onClick={() => setCategoryModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleSaveCategory} className="modal-body">
                <div className="form-group">
                  <label>Tên danh mục</label>
                  <input type="text" value={categoryForm.categoryName} onChange={e => setCategoryForm({ ...categoryForm, categoryName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={2} />
                </div>
                <div className="modal-footer" style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button type="button" className="btn-cancel" onClick={() => setCategoryModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-primary">Lưu danh mục</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
