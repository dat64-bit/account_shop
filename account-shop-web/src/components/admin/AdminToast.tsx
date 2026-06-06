"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface ToastState {
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContextType {
  showToast: (message: string, type?: ToastState["type"]) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastState["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="admin-toast-container animate-in slide-in-from-right duration-300">
          <div className={`admin-toast toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === "success" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
            </div>
            <div className="toast-content">
              <h5>{toast.type === "success" ? "Thành công" : "Thất bại"}</h5>
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook that manages toast state. Usage:
 *   const { showToast } = useAdminToast();
 *   showToast('Thành công!', 'success');
 */
export function useAdminToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAdminToast must be used within an AdminToastProvider");
  }
  return context;
}
