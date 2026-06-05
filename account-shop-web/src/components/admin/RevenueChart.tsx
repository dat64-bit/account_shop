import React from 'react';

export default function RevenueChart() {
  return (
    <div className="revenue-chart-skeleton" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
      <h3>Biểu đồ doanh thu</h3>
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        [Khu vực hiển thị biểu đồ]
      </div>
    </div>
  );
}
