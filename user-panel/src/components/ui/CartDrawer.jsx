"use client";

import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomImg from "@/components/CustomImg";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    totalItemCount,
    user,
    stockWarning,
    clearStockWarning,
  } = useCart();

  const [termsAgreed, setTermsAgreed] = useState(true);
  const [loginWarning, setLoginWarning] = useState(false);

  const handleCheckoutClick = (e) => {
    if (!user) {
      e.preventDefault();
      setLoginWarning(true);
    } else {
      closeCart();
      router.push("/checkout");
    }
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full sm:max-w-[460px] w-full bg-white shadow-2xl z-[1001] flex flex-col animate-in slide-in-from-right duration-300 ease-out font-sans">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl sm:text-2xl font-canela font-normal text-gray-900 tracking-tight">
              Your Bag ({totalItemCount})
            </h3>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-full text-gray-500 hover:text-black transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Stock Warning Banner inside Drawer */}
        {stockWarning && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{stockWarning}</span>
            </div>
            <button
              onClick={clearStockWarning}
              className="text-amber-700 hover:text-amber-950 underline text-[11px] shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Drawer Body / Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
                <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-lg font-canela text-gray-900">Your bag is empty</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">
                  Explore our luxury fine jewelry collections to add items to your bag.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 px-6 py-3 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-gray-100">
              {cartItems.map((item) => {
                const maxStock = typeof item.stock === "number" ? item.stock : 999;
                const isMaxReached = item.quantity >= maxStock;

                const specs = [
                  item.purity,
                  item.color,
                  item.diamondShape,
                  item.diamondQuality,
                ]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <div key={item.key} className="pt-6 first:pt-0 flex gap-4 items-start">
                    {/* Thumbnail Image */}
                    <div className="w-24 h-24 bg-white border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-2">
                      <CustomImg
                        srcAttr={item.image}
                        altAttr={item.name}
                        width={90}
                        height={90}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Item Details & Pricing */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-canela font-normal text-gray-900 leading-snug">
                          {item.name}
                        </h4>
                        <div className="text-sm font-normal font-sans text-gray-900 shrink-0">
                          ₹{item.price.toLocaleString("en-IN")}
                        </div>
                      </div>

                      {specs && (
                        <p className="text-xs text-gray-500 font-sans">
                          {specs}
                        </p>
                      )}

                      {item.ringSize && (
                        <p className="text-xs text-gray-500 font-sans">
                          Ring Size: {item.ringSize}
                        </p>
                      )}

                      {/* Stock limit notice */}
                      {typeof item.stock === "number" && item.stock < 10 && (
                        <p className="text-[10px] font-semibold text-amber-700 font-mono">
                          In Stock: {item.stock} left
                        </p>
                      )}

                      {/* Quantity Controls & Trash */}
                      <div className="flex items-center gap-4 pt-3">
                        <span className="text-xs text-gray-700 font-medium">Qty</span>
                        <div className="flex items-center border border-gray-300 w-24 h-8 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, -1)}
                            className="w-7 h-full flex items-center justify-center text-gray-600 hover:text-black text-sm select-none"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-medium text-xs text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, 1)}
                            disabled={isMaxReached}
                            className={`w-7 h-full flex items-center justify-center text-sm select-none ${
                              isMaxReached
                                ? "text-gray-300 cursor-not-allowed bg-gray-50"
                                : "text-gray-600 hover:text-black cursor-pointer"
                            }`}
                            title={isMaxReached ? `Stock limit reached (${maxStock})` : "Increase"}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.key)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-white space-y-4 sticky bottom-0 z-10">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-base font-sans">
              <span className="font-normal text-gray-900">Sub Total:</span>
              <span className="font-medium text-gray-900 text-lg">
                ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-xs text-gray-500 font-sans">
              Taxes and shipping calculated at checkout
            </p>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded-none accent-[#202A4E]"
              />
              <span>
                I have read and agree to the{" "}
                <Link href="/terms-and-conditions" onClick={closeCart} className="underline hover:text-black">Terms and Conditions</Link>,{" "}
                <Link href="/returns-shipping" onClick={closeCart} className="underline hover:text-black">Shipping Policy</Link>,{" "}
                <Link href="/privacy-policy" onClick={closeCart} className="underline hover:text-black">Privacy Policy</Link>, and{" "}
                <Link href="/returns-shipping" onClick={closeCart} className="underline hover:text-black">Return Policy</Link>.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full border border-[#202A4E] text-[#202A4E] hover:bg-[#202A4E] hover:text-white py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none text-center flex items-center justify-center"
              >
                CHECKOUT
              </button>

              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full bg-[#202A4E] hover:bg-black text-white py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none text-center flex items-center justify-center"
              >
                VIEW YOUR BAG
              </Link>
            </div>

            {/* Login Warning Alert Below Buttons */}
            {loginWarning && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>For checkout, you need to login first.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginWarning(false)}
                  className="text-amber-700 hover:text-amber-950 underline text-[11px] shrink-0 cursor-pointer font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
