"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import api from '@/lib/axios';
import { AdminToast, useAdminToast } from '@/components/admin/AdminToast';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';

const Package = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.6"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);

const Trash2 = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, decrementQuantity, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'partial'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const isProcessingRef = React.useRef(false);
  const { toast, showToast } = useAdminToast();

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thanh toán');
      setIsCartOpen(false);
      return;
    }
    
    if (cartItems.length === 0) return;
    if (isProcessingRef.current) return;

    setCheckoutStatus('processing');
    setErrorMsg('');
    isProcessingRef.current = true;

    let successCount = 0;

    try {
      for (const item of cartItems) {
        for (let i = 0; i < item.quantity; i++) {
          await api.post('/user/orders/checkout', {
            productId: item.productId,
            planId: item.planId,
            quantity: 1
          });
          successCount++;
          decrementQuantity(item.productId, item.planId);
        }
      }
      
      // All successful
      setCheckoutStatus('success');
      showToast('Thanh toán thành công! Đang chuyển hướng...', 'success');
      setTimeout(() => {
        setIsCartOpen(false);
        isProcessingRef.current = false;
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      if (successCount > 0) {
        setCheckoutStatus('partial');
        const msg = `Đã thanh toán thành công ${successCount} tài khoản. Lỗi với phần còn lại: ${err.response?.data || err.message}`;
        setErrorMsg(msg);
        showToast('Thanh toán thành công một phần', 'success');
      } else {
        setCheckoutStatus('error');
        const msg = err.response?.data || err.message || 'Lỗi trong quá trình thanh toán. Vui lòng kiểm tra lại số dư.';
        setErrorMsg(msg);
        showToast('Lỗi thanh toán', 'error');
      }
      isProcessingRef.current = false;
    }
  };

  return (
    <div className="mobile-drawer-overlay" onClick={() => setIsCartOpen(false)} style={{ zIndex: 10000 }}>
      <AdminToast toast={toast} />
      <div 
        className="mobile-drawer animate-in slide-in-from-right duration-300" 
        onClick={e => e.stopPropagation()}
        style={{ transform: 'none', right: 0, left: 'auto', width: '100%', maxWidth: '400px' }}
      >
        <div className="drawer-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3>Giỏ hàng của bạn</h3>
          <button className="btn-close-drawer" onClick={() => setIsCartOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="drawer-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100% - 60px)' }}>
          
          {cartItems.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Package size={48} />
              <p style={{ marginTop: 15 }}>Giỏ hàng trống</p>
              <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setIsCartOpen(false)}>Tiếp tục mua sắm</button>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {checkoutStatus === 'success' && (
                  <div style={{ padding: '15px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                    Thanh toán thành công! Đang chuyển hướng...
                  </div>
                )}
                {checkoutStatus === 'partial' && (
                  <div style={{ padding: '15px', background: '#fffbeb', color: '#d97706', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                    <strong>Thanh toán một phần:</strong> {errorMsg}
                  </div>
                )}
                {checkoutStatus === 'error' && (
                  <div style={{ padding: '15px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                    <strong>Lỗi thanh toán:</strong> {errorMsg}
                  </div>
                )}
                
                {cartItems.map((item) => (
                  <CartItem 
                    key={`${item.productId}-${item.planId}`}
                    item={item}
                    isProcessing={checkoutStatus === 'processing'}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
              
              <CartSummary 
                total={cartTotal}
                isProcessing={checkoutStatus === 'processing'}
                onCheckout={handleCheckout}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
