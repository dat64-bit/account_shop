import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  productId: number;
  productName: string;
  categoryName: string;
  imageUrl?: string;
  startingPrice?: number;
}

const Package = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.6"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);

export default function ProductCard({
  productId,
  productName,
  categoryName,
  imageUrl,
  startingPrice
}: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-card-image" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Package size={42} />
        )}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: 'var(--text-sub)' }}>
          CÓ SẴN
        </div>
      </div>
      <div className="product-card-body">
        <div className="product-card-cat">{categoryName}</div>
        <Link href={`/products/${productId}`} className="product-card-name">{productName}</Link>
        <div className="product-card-price">
          {startingPrice != null
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(startingPrice)
            : 'Liên hệ'}
        </div>
      </div>
      <div className="product-card-action">
        <Link href={`/products/${productId}`} className="btn-premium">
          Chi tiết sản phẩm
        </Link>
      </div>
    </div>
  );
}
