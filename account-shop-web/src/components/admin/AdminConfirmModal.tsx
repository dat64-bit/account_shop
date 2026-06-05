"use client";

import React, { ReactNode } from "react";
import Portal from "@/components/common/Portal";

type ConfirmVariant = "danger" | "warning" | "info";

interface AdminConfirmModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Modal title */
  title: ReactNode;
  /** Modal description / body text */
  description: ReactNode;
  /** Visual variant — affects icon and confirm button style */
  variant?: ConfirmVariant;
  /** Label for confirm button */
  confirmLabel?: string;
  /** Label for cancel button */
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const WarningIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const InfoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

/** Reusable confirmation modal for admin destructive/important actions. */
export function AdminConfirmModal({
  open,
  title,
  description,
  variant = "warning",
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy bỏ",
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  if (!open) return null;
  return (
    <Portal>
      <div className="admin-modal-overlay">
        <div className="admin-confirm-modal animate-in zoom-in duration-300">
          <div className={`confirm-icon-wrapper ${variant}`}>
            {variant === "danger" || variant === "warning" ? <WarningIcon /> : <InfoIcon />}
          </div>
          <h3 className="confirm-title">{title}</h3>
          <div className="confirm-desc">{description}</div>
          <div className="confirm-actions">
            <button className="btn-confirm-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              className={`btn-confirm-action ${variant === "danger" || variant === "warning" ? "danger" : ""}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
