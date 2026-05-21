"use client";

import React, { ReactNode } from "react";

interface AdminTableCardProps {
  /** Card heading / title */
  title: string;
  /** Optional element rendered on the right side of the card header (e.g. an "Add" button) */
  headerAction?: ReactNode;
  children: ReactNode;
  /** Extra className on the outer wrapper */
  className?: string;
}

/**
 * Reusable table card wrapper for admin pages.
 *
 * Renders:
 *   .admin-table-container.animate-in
 *     .card-header
 *       <title>
 *       [headerAction]
 *     .table-responsive
 *       {children}
 *
 * Usage:
 *   <AdminTableCard title="Quản lý người dùng">
 *     <table className="admin-table">...</table>
 *   </AdminTableCard>
 */
export function AdminTableCard({ title, headerAction, children, className = "" }: AdminTableCardProps) {
  return (
    <div className={`admin-table-container animate-in ${className}`}>
      <div className="card-header border-b border-slate-100">
        <h2 className="card-title">{title}</h2>
        {headerAction}
      </div>
      <div className="table-responsive">{children}</div>
    </div>
  );
}
