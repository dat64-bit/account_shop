import React from 'react';
import Button from '@/components/common/Button';

interface CartSummaryProps {
  total: number;
  isProcessing: boolean;
  onCheckout: () => void;
}

export default function CartSummary({ total, isProcessing, onCheckout }: CartSummaryProps) {
  return (
    <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
        <span>Tổng tiền:</span>
        <span style={{ color: 'var(--primary)' }}>{total.toLocaleString('vi-VN')}đ</span>
      </div>
      <Button 
        variant="primary" 
        style={{ width: '100%', padding: '14px', fontSize: '16px' }}
        onClick={onCheckout}
        isLoading={isProcessing}
      >
        THANH TOÁN
      </Button>
    </div>
  );
}
