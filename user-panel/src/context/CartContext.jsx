"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("jewellers_cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
    }
    setIsMounted(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem("jewellers_cart", JSON.stringify(cartItems));
      } catch (e) {
        console.error("Failed to save cart to localStorage:", e);
      }
    }
  }, [cartItems, isMounted]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (productData) => {
    // Generate unique key based on product ID & variant choices
    const itemKey = `${productData.id}-${productData.color || ""}-${productData.purity || ""}-${productData.ringSize || ""}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += productData.quantity || 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            key: itemKey,
            id: productData.id,
            name: productData.name,
            price: parseFloat(productData.price || 0),
            image: productData.image,
            color: productData.color || "",
            purity: productData.purity || "",
            ringSize: productData.ringSize || "",
            sku: productData.sku || "",
            diamondType: productData.diamondType || "",
            diamondShape: productData.diamondShape || "",
            diamondQuality: productData.diamondQuality || "",
            quantity: productData.quantity || 1,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (key, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.key === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (key) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalItemCount = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
