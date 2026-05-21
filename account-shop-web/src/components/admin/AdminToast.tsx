"use client";

import { useState, useCallback } from "react";

export interface ToastState {
  message: string;
  type: "success" | "error";
}

interface AdminToastProps {
  toast: ToastState | null;
}

/** Reusable Toast notification display component for admin pages. */
export function AdminToast({ toast }: AdminToastProps) {
  if (!toast) return null;
  return (
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
  );
}

/**
 * Hook that manages toast state. Usage:
 *   const { toast, showToast } = useAdminToast();
 *   ...
 *   <AdminToast toast={toast} />
 */
export function useAdminToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return { toast, showToast };
}
