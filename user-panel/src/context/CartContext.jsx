"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/db";
import { store } from "@/store/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  syncCart,
  addToCart as addToCartAction,
  updateQuantity as updateQuantityAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  openCart as openCartAction,
  closeCart as closeCartAction,
  clearStockWarning as clearStockWarningAction,
  selectCartItems,
  selectIsCartOpen,
  selectIsCartLoaded,
  selectCartStockWarning,
  selectCartSubtotal,
  selectCartTotalCount,
} from "@/store/slice/cartSlice";

const CartContext = createContext();

function CartConsumerProvider({ children }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const isCartOpen = useSelector(selectIsCartOpen);
  const isCartLoaded = useSelector(selectIsCartLoaded);
  const stockWarning = useSelector(selectCartStockWarning);
  const subtotal = useSelector(selectCartSubtotal);
  const totalItemCount = useSelector(selectCartTotalCount);

  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Listen to Supabase Auth State
  useEffect(() => {
    let authSubscription = null;

    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data?.user || null);
      });

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      authSubscription = data?.subscription;
    }

    setIsMounted(true);

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch User Cart via Redux Async Thunk on Auth Change
  useEffect(() => {
    if (!isMounted) return;
    dispatch(fetchCart(user?.id || null));
  }, [user, isMounted, dispatch]);

  // 3. Sync Cart Changes with Supabase Database via Redux Async Thunk
  useEffect(() => {
    if (!isMounted || !isCartLoaded) return;
    dispatch(syncCart({ userId: user?.id || null, cartItems }));
  }, [cartItems, user, isMounted, isCartLoaded, dispatch]);

  // Helper Actions
  const openCart = () => dispatch(openCartAction());
  const closeCart = () => dispatch(closeCartAction());
  const clearStockWarning = () => dispatch(clearStockWarningAction());

  const addToCart = (productData) => {
    dispatch(addToCartAction(productData));
    return { success: true };
  };

  const updateQuantity = (key, delta) => {
    dispatch(updateQuantityAction({ key, delta }));
  };

  const removeFromCart = (key) => {
    dispatch(removeFromCartAction(key));
  };

  const clearCart = () => {
    dispatch(clearCartAction());
  };

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
        user,
        stockWarning,
        clearStockWarning,
        isCartLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function CartProvider({ children }) {
  return (
    <Provider store={store}>
      <CartConsumerProvider>{children}</CartConsumerProvider>
    </Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
