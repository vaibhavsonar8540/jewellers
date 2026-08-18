"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import CustomImg from "@/components/CustomImg";

export default function ProductCard({ product }) {
  // Set initial active color to the first color in the product's colors array
  const initialColorId = product?.colors?.[0]?.id || product?.colors?.[0]?.name || null;
  const [activeColorId, setActiveColorId] = useState(initialColorId);

  // Compute first fallback thumbnail image from variation_combo or variationCombo
  const firstCombo = (product?.variation_combo || product?.variationCombo || [])?.find(
    (c) => c.thumbnail || (Array.isArray(c.images) && c.images[0]) || (c.media_mapping?.thumbnail)
  );
  const comboImage =
    firstCombo?.thumbnail ||
    firstCombo?.images?.[0] ||
    firstCombo?.media_mapping?.thumbnail ||
    (Array.isArray(firstCombo?.media_mapping?.images) && firstCombo?.media_mapping?.images[0]);

  // Find active color object or name
  const activeColorObj = product?.colors?.find(
    (c) => c.id === activeColorId || c.name === activeColorId
  );
  const activeColorName = activeColorObj?.name || activeColorId;

  // Resolve color-specific image
  let selectedImage =
    (activeColorId && product?.colorImageMap?.[activeColorId]) ||
    (activeColorName && product?.colorImageMap?.[activeColorName]);

  if (!selectedImage && product?.variation_combo && Array.isArray(product.variation_combo)) {
    const matchedCombo = product.variation_combo.find(
      (c) =>
        c.color_id === activeColorId ||
        c.gold_color?.toLowerCase() === activeColorName?.toLowerCase() ||
        c.color?.toLowerCase() === activeColorName?.toLowerCase()
    );
    if (matchedCombo) {
      const m = matchedCombo.media_mapping || matchedCombo;
      selectedImage =
        m?.thumbnail ||
        (Array.isArray(m?.images) && m.images[0]) ||
        matchedCombo.thumbnail ||
        matchedCombo.images?.[0];
    }
  }

  const displayImage =
    selectedImage ||
    product?.image ||
    product?.thumbnail ||
    comboImage ||
    "";

  const productUrl = `/product/${product?.id}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col justify-between group relative">
      
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center">
        {/* Collection Pill Badge */}
        {product?.collection_name && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs shadow-2xs">
              {product.collection_name}
            </span>
          </div>
        )}

        {/* Product Image Link */}
        <Link href={productUrl} className="w-full h-full flex items-center justify-center">
          {displayImage ? (
            <CustomImg
              srcAttr={displayImage}
              altAttr={product?.name || "Product"}
              titleAttr={product?.name || "Product"}
              width={350}
              height={350}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 space-y-1">
              <Package className="w-8 h-8" />
              <span className="text-[9px] font-semibold">No Image</span>
            </div>
          )}
        </Link>
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-1">
          {/* Product Name Title Link */}
          <Link href={productUrl} className="block">
            <h3 className="font-sans font-medium text-black text-base leading-snug line-clamp-2 hover:text-amber-800 transition-colors">
              {product?.name}
            </h3>
          </Link>
        </div>

        {/* Bottom Single Row: Price on left, Color Swatches on right */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex gap-0.5 items-center text-sm font-bold text-gray-900 tracking-tight">
            <span className="!text-xs">₹</span>
            <span>{product?.price ? Number(product.price).toLocaleString("en-IN") : "0"}</span>
          </div>

          {/* Metal Color Circles Swatches */}
          {product?.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              {product.colors.map((col, idx) => {
                const colorKey = col.id || col.name || idx;
                const isActive = activeColorId === col.id || activeColorId === col.name || (!activeColorId && idx === 0);
                return (
                  <button
                    key={colorKey}
                    type="button"
                    title={col.name || "Metal Color"}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveColorId(col.id || col.name);
                    }}
                    onMouseEnter={() => setActiveColorId(col.id || col.name)}
                    className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? "ring-2 ring-black ring-offset-2 scale-110 z-10"
                        : "opacity-75 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: col.hex_code || col.hexCode || col.hex || "#FFD700" }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}