import React from 'react';

export default function ShippingForm() {
  return (
    <div className="shipping-form-skeleton" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>Thông tin nhận hàng</h3>
      <div className="form-group">
        <label>Email nhận tài khoản <span className="required">*</span></label>
        <input type="email" placeholder="Ví dụ: email@gmail.com" className="form-control" />
        <small style={{ color: 'var(--text-muted)' }}>Tài khoản sẽ được gửi trực tiếp về email này của bạn.</small>
      </div>
      <div className="form-group" style={{ marginTop: '15px' }}>
        <label>Ghi chú thêm (Tùy chọn)</label>
        <textarea placeholder="Ghi chú cho đơn hàng..." className="form-control" rows={3}></textarea>
      </div>
    </div>
  );
}
