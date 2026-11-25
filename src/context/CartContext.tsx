'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productId: string;
  title: string;
  slug?: string;
  image: string;
  price: number;
  originalPrice: number;
  size: string;
  color?: string;
  quantity: number;
  sku?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  itemsCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'vantero_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (_) {
      // Ignore parse errors
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (_) {}
    }
  }, [cart, isHydrated]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.size === newItem.size &&
          (item.color || '') === (newItem.color || '')
      );

      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.size === size &&
            (item.color || '') === (color || '')
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    size: string,
    quantity: number,
    color?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          item.size === size &&
          (item.color || '') === (color || '')
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (_) {}
  };

  const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemsCount,
        subtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
