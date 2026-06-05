import React from 'react';

export default function PaymentMethod() {
  return (
    <div className="payment-method-skeleton" style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>Phương thức thanh toán</h3>
      <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid var(--primary)', borderRadius: '6px', background: '#fff' }}>
          <input type="radio" name="payment" defaultChecked />
          <strong>Chuyển khoản ngân hàng (VND)</strong>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: '1px solid var(--border)', borderRadius: '6px', opacity: 0.6 }}>
          <input type="radio" name="payment" disabled />
          <strong>Crypto (USDT/TRX) - Sắp ra mắt</strong>
        </label>
      </div>
    </div>
  );
}
