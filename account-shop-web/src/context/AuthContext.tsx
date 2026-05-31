"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';

interface User {
  sub: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Khôi phục nhanh thông tin user từ localStorage để hiển thị UI lập tức
    const storedUser = localStorage.getItem('user_info');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    // Gọi API /me để kiểm tra phiên đăng nhập thực tế từ HttpOnly Cookie
    const checkSession = async () => {
      try {
        const res = await api.get('/auth/me');
        const rawRole = res.data.role || '';
        const role = rawRole.startsWith('ROLE_') ? rawRole : `ROLE_${rawRole.toUpperCase()}`;
        const userData = {
          sub: res.data.username,
          role: role,
          email: res.data.email
        };
        setUser(userData);
        localStorage.setItem('user_info', JSON.stringify(userData));
      } catch (err) {
        // Token không hợp lệ hoặc hết hạn -> Đăng xuất âm thầm (không redirect reload)
        logout(false);
      }
    };

    checkSession();
  }, []);

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<any>(token);
      const rawRole = decoded.role || '';
      const role = rawRole.startsWith('ROLE_') ? rawRole : `ROLE_${rawRole.toUpperCase()}`;
      const userData = {
        sub: decoded.sub,
        role: role,
        email: decoded.email || ''
      };
      setUser(userData);
      localStorage.setItem('user_info', JSON.stringify(userData));
    } catch (e) {
      console.error("Invalid token format", e);
    }
  };

  const logout = async (redirect = true) => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout API error:", e);
    }
    localStorage.removeItem('user_info');
    setUser(null);
    if (redirect && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
