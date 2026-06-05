"use client";

import { useState } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// SVG Components
const User = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const Lock = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const Eye = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOff = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);
const AlertCircle = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);
const X = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { username: form.username, password: form.password });
      login(res.data);
      router.push('/'); // Chuyển hướng về trang chủ
    } catch (err: any) {
      setError(err.response?.data || 'Tên đăng nhập hoặc mật khẩu không đúng.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-card animate-in" style={{ position: 'relative' }}>
      <Link href="/" className="auth-close-btn"><X size={16} /></Link>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img src="/logo.png" alt="Logo" style={{ height: 60, marginBottom: 12 }} />
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Chào mừng trở lại!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Đăng nhập để trải nghiệm dịch vụ tốt nhất tại VanDatPremium
        </p>
      </div>

      <div className="auth-tabs">
        <div className="auth-tab active">Đăng nhập</div>
        <Link href="/register" className="auth-tab">Đăng ký</Link>
      </div>

      {error && (
        <div className="auth-alert error">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Tài khoản <span className="required">*</span></label>
          <div className="input-wrapper">
            <span className="input-icon"><User size={16} /></span>
            <input name="username" type="text" placeholder="Tên đăng nhập" value={form.username} onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Mật khẩu <span className="required">*</span></label>
          <div className="input-wrapper">
            <span className="input-icon"><Lock size={16} /></span>
            <input name="password" type={showPass ? 'text' : 'password'} placeholder="Mật khẩu" value={form.password} onChange={handleChange} required />
            <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
        <div className="auth-switch">
          Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
        </div>
      </form>
    </div>
  );
}
