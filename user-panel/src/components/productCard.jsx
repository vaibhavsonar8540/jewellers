"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import CustomImg from "@/components/CustomImg";

export default function ProductCard({ product }) {
  // Set initial active color to the first color in the product's colors array
  const firstColorId = product?.colors?.[0]?.id || null;
  const [activeColorId, setActiveColorId] = useState(firstColorId);

  // Compute image based on active color selection, fallback to default main image
  const displayImage =
    (activeColorId && product?.colorImageMap?.[activeColorId]) ||
    product?.image ||
    "";

  const productUrl = `/product/${product?.id}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden flex flex-col justify-between group relative">
      
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#FAF9F6] overflow-hidden p-3 flex items-center justify-center">
        {/* Collection Pill Badge */}
        {product?.collection_name && (
          <div className="absolute top-2 left-2 z-10">
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
              altAttr={product.name}
              titleAttr={product.name}
              width={350}
              height={350}
              className="w-full h-full object-contain"
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
          {/* Category & SKU row */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
            <span className="truncate text-amber-800 font-bold uppercase tracking-wider">
              {product?.category_name || "Jewelry"}
            </span>
            {product?.sku && (
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[9px] text-gray-500 font-semibold">
                {product.sku}
              </span>
            )}
          </div>

          {/* Product Name Title Link */}
          <Link href={productUrl} className="block">
            <h3 className="font-sans font-medium text-gray-900 text-xs leading-snug line-clamp-2 hover:text-amber-800 transition-colors">
              {product?.name}
            </h3>
          </Link>
        </div>

        {/* Bottom Single Row: Price on left, Color Swatches on right */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          {/* Price */}
          <div className="flex gap-0.5 items-center text-sm font-bold text-gray-900 tracking-tight">
            <span className="!text-xs">₹</span>
            <span>{product?.price ? product.price.toLocaleString("en-IN") : "0"}</span>
          </div>

          {/* Metal Color Circles Swatches */}
          {product?.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2.5 px-1">
              {product.colors.map((col) => {
                const isActive = activeColorId === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    title={col.name}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveColorId(col.id);
                    }}
                    onMouseEnter={() => setActiveColorId(col.id)}
                    className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? "ring-2 ring-black ring-offset-2 scale-110 z-10"
                        : "opacity-75 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: col.hex_code || col.hex || "#FFD700" }}
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