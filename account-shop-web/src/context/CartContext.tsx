"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: number;
  productName: string;
  planId: number;
  planName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  categoryName?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: number, planId: number) => void;
  updateQuantity: (productId: number, planId: number, quantity: number) => void;
  decrementQuantity: (productId: number, planId: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('vd_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('vd_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  const addToCart = (newItem: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === newItem.productId && item.planId === newItem.planId);
      if (existing) {
        return prev.map(item => 
          (item.productId === newItem.productId && item.planId === newItem.planId)
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, planId: number) => {
    setCartItems(prev => prev.filter(item => !(item.productId === productId && item.planId === planId)));
  };

  const updateQuantity = (productId: number, planId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, planId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      (item.productId === productId && item.planId === planId)
        ? { ...item, quantity }
        : item
    ));
  };

  const decrementQuantity = (productId: number, planId: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId && item.planId === planId);
      if (existing && existing.quantity <= 1) {
        return prev.filter(item => !(item.productId === productId && item.planId === planId));
      }
      return prev.map(item => 
        (item.productId === productId && item.planId === planId)
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      decrementQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
