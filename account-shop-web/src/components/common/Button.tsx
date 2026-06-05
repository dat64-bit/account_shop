import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  children, 
  disabled, 
  ...props 
}: ButtonProps) {
  
  // Basic mapping of variants to classes based on current CSS conventions
  let variantClass = 'btn-primary';
  if (variant === 'danger') variantClass = 'btn-danger';
  else if (variant === 'outline') variantClass = 'btn-outline';
  else if (variant === 'secondary') variantClass = 'btn-secondary'; // Assuming this exists or falls back
  
  return (
    <button 
      className={`${variantClass} ${className} ${isLoading ? 'loading' : ''}`}
      disabled={disabled || isLoading}
      style={{ opacity: isLoading ? 0.7 : 1, position: 'relative' }}
      {...props}
    >
      {isLoading ? 'Đang xử lý...' : children}
    </button>
  );
}
