import React from 'react';

const Package = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.6"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);

const Trash2 = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

interface CartItemProps {
  item: any; // Ideally we should export CartItem interface from Context
  isProcessing: boolean;
  onUpdateQuantity: (productId: number, planId: number, quantity: number) => void;
  onRemove: (productId: number, planId: number) => void;
}

export default function CartItem({ item, isProcessing, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: '70px', height: '70px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={24} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>{item.categoryName}</div>
        <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{item.productName}</h4>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>Gói: {item.planName}</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <button 
              disabled={isProcessing}
              style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
              onClick={() => onUpdateQuantity(item.productId, item.planId, item.quantity - 1)}
            >-</button>
            <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: '500' }}>{item.quantity}</span>
            <button 
              disabled={isProcessing}
              style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
              onClick={() => onUpdateQuantity(item.productId, item.planId, item.quantity + 1)}
            >+</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <strong style={{ color: 'var(--primary)' }}>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</strong>
            <button 
              disabled={isProcessing}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex' }}
              onClick={() => onRemove(item.productId, item.planId)}
              title="Xóa sản phẩm"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
