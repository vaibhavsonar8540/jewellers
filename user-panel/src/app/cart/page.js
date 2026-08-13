"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShoppingBag, Plus, Minus, Trash2, ArrowLeft, Check } from "lucide-react";
import CustomImg from "@/components/CustomImg";
import { useCart } from "@/context/CartContext";

// Trust Feature Icons
import returnIcon from "@/assets/icons/30days-return.svg";
import packingIcon from "@/assets/icons/elegant-packing.svg";
import resizingIcon from "@/assets/icons/free-resizing.svg";
import pricingIcon from "@/assets/icons/competative-pricing.svg";
import shippingIcon from "@/assets/icons/free-shipping.svg";
import warrantyIcon from "@/assets/icons/lifetime-warranty.svg";

const trustFeatures = [
  { id: 1, title: "15 Days Free Return", icon: returnIcon },
  { id: 2, title: "Elegant Packaging", icon: packingIcon },
  { id: 3, title: "Free Resizing", icon: resizingIcon },
  { id: 4, title: "Competitive Pricing", icon: pricingIcon },
  { id: 5, title: "Free Shipping", icon: shippingIcon },
  { id: 6, title: "Lifetime Warranty", icon: warrantyIcon },
];

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, totalItemCount } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(true);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "JEWEL10") {
      setDiscount(subtotal * 0.1);
    } else if (promoCode.trim()) {
      alert("Invalid promo code. Try 'JEWEL10' for 10% off.");
    }
  };

  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-800 font-medium">My Bag</span>
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 pt-2">
        
        {/* Title Header with Icon & Line */}
        <div className="text-center py-6 relative flex flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-gray-900 stroke-[1.4]" />
            <h1 className="text-3xl sm:text-4xl font-canela font-normal text-gray-900 tracking-tight">
              My Bag
            </h1>
          </div>
          <div className="w-48 h-px bg-gray-200 mt-4" />
        </div>

        {cartItems.length === 0 ? (
          /* Empty Bag View */
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
              <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
            </div>
            <h2 className="text-2xl font-canela font-normal text-gray-900">Your Bag is Empty</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-sans">
              You haven't added any luxury jewelry items to your bag yet. Explore our handcrafted collections to find your perfect piece.
            </p>
            <Link
              href="/shop"
              className="mt-4 px-8 py-4 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-colors rounded-none"
            >
              <ArrowLeft className="w-4 h-4" /> Explore Shop
            </Link>
          </div>
        ) : (
          /* 2-Column Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pt-8">
            
            {/* Left Column: Items List */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                {cartItems.map((item) => {
                  // Build line for specs e.g. Size: 7 mm | Yellow Gold
                  const specsList = [
                    item.ringSize ? `Size: ${item.ringSize}` : null,
                    item.purity,
                    item.color,
                    item.diamondShape,
                    item.diamondQuality,
                  ].filter(Boolean);

                  return (
                    <div
                      key={item.key}
                      className="border border-gray-200/80 p-5 sm:p-6 bg-white shadow-xs flex gap-5 sm:gap-6 items-start"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-2">
                        <CustomImg
                          srcAttr={item.image}
                          altAttr={item.name}
                          width={120}
                          height={120}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Specs */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg sm:text-2xl font-canela font-normal text-gray-900 leading-snug">
                            {item.name}
                          </h3>
                          <div className="text-base sm:text-xl font-normal text-gray-900 shrink-0 font-sans">
                            ₹{item.price.toLocaleString("en-IN")}
                          </div>
                        </div>

                        {specsList.length > 0 && (
                          <p className="text-xs sm:text-sm text-gray-500 font-mono leading-relaxed">
                            {specsList.join(" | ")}
                          </p>
                        )}

                        {item.sku && (
                          <p className="text-xs text-gray-400 font-mono uppercase">
                            SKU: {item.sku}
                          </p>
                        )}

                        {/* Quantity Counter & Trash Button */}
                        <div className="flex items-center gap-4 pt-3">
                          <span className="text-xs sm:text-sm text-gray-700 font-medium font-mono">Qty :</span>
                          <div className="flex items-center border border-gray-300 w-28 h-9 bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, -1)}
                              className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-black text-sm select-none"
                            >
                              -
                            </button>
                            <span className="flex-1 text-center font-medium text-sm text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, 1)}
                              className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-black text-sm select-none"
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

              {/* Continue Shopping Button */}
              <div className="pt-4">
                <Link
                  href="/collection/jewellery"
                  className="inline-block px-6 py-3 border border-gray-300 hover:border-black text-xs font-semibold uppercase tracking-wider text-gray-800 transition-colors rounded-none"
                >
                  Continue Shopping
                </Link>
              </div>

            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24 space-y-6">
                
                <h2 className="text-2xl font-canela font-normal text-gray-900">
                  Order Summary
                </h2>

                <div className="border border-gray-200/80 p-6 sm:p-8 space-y-6 bg-white shadow-lg">
                  
                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <label className="block text-xs text-gray-600 font-medium">Promo code</label>
                    <div className="flex items-center gap-0">
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 border border-r-0 border-gray-300 px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                      />
                      <button
                        type="submit"
                        className="bg-[#202A4E] hover:bg-black text-white text-xs font-bold px-6 py-2.5 uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                      >
                        APPLY
                      </button>
                    </div>
                  </form>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 pt-2 text-sm font-sans">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-medium text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="flex items-center justify-between text-gray-700">
                      <span>Promotional Savings Offer:</span>
                      <span className="font-medium text-emerald-600">
                        {discount > 0 ? `-₹${discount.toLocaleString("en-IN")}` : "₹0"}
                      </span>
                    </div>

                    <div className="w-full h-px bg-gray-200 my-2" />

                    <div className="flex items-center justify-between text-base sm:text-lg text-gray-900 font-medium pt-1">
                      <span>Total</span>
                      <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <label className="flex items-start gap-2.5 text-xs text-gray-600 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-0.5 rounded-none accent-[#202A4E]"
                    />
                    <span>
                      I have read and agree to the{" "}
                      <span className="underline hover:text-black">Terms and Conditions</span>,{" "}
                      <span className="underline hover:text-black">Shipping Policy</span>,{" "}
                      <span className="underline hover:text-black">Privacy Policy</span>, and{" "}
                      <span className="underline hover:text-black">Return Policy</span>.
                    </span>
                  </label>

                  {/* Checkout Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => alert("Proceeding to checkout page...")}
                      className="w-full bg-[#202A4E] hover:bg-black text-white font-bold tracking-widest py-4 uppercase text-sm transition-colors duration-200 rounded-none cursor-pointer"
                    >
                      CHECKOUT
                    </button>
                  </div>



                </div>

              </div>
            </div>

          </div>
        )}

        {/* Trust Features Bar */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-center text-center">
            {trustFeatures.map((feat) => (
              <div key={feat.id} className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src={feat.icon}
                    alt={feat.title}
                    width={48}
                    height={48}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-800 max-w-[120px] leading-snug">
                  {feat.title}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
