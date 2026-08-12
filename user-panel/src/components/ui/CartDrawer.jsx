"use client";

import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import CustomImg from "@/components/CustomImg";

export default function CartDrawer({ isOpen, onClose }) {
  // Cart Items state (empty array by default, dynamic)
  const [cartItems, setCartItems] = useState([]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full sm:max-w-md w-full bg-white shadow-2xl z-[1001] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-gray-900" />
            <h3 className="text-lg font-serif font-bold text-gray-900 tracking-tight">
              Your Shopping Bag
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body / Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200/80 text-gray-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-base font-serif font-bold text-gray-900">Your Shopping Bag is empty</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Looks like you haven't added any luxury jewelry items to your bag yet.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                  
                  {/* Thumbnail Image */}
                  <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                    <CustomImg
                      srcAttr={item.image}
                      altAttr={item.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Item Specs & Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                      {item.name}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                      {item.color && (
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-semibold text-gray-700">
                          {item.color}
                        </span>
                      )}
                      {item.purity && <span>{item.purity}</span>}
                    </div>

                    <div className="text-xs font-bold text-gray-900 pt-1">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-1 text-gray-600 hover:text-black hover:bg-gray-200/60 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-1 text-gray-600 hover:text-black hover:bg-gray-200/60 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-700 hover:text-red-600 transition-colors p-1.5 cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 space-y-4 sticky bottom-0 z-10">
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="text-sm font-bold text-gray-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Taxes and shipping calculated at checkout. Free insured delivery included.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => alert("Proceeding to checkout page...")}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/cart"
                onClick={onClose}
                className="w-full py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-900 bg-white border border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl transition-all block cursor-pointer"
              >
                VIEW YOUR BAG
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
