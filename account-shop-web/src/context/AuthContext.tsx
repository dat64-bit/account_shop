"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  sub: string;
  role: string;
  exp: number;
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
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch {
        logout();
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    try {
      setUser(jwtDecode<User>(token));
    } catch (e) {
      console.error("Invalid token format");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
