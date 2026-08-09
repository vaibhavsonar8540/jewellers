"use client";

import React from "react";
import { Power, Tag, Package, MoreVertical, Globe } from "lucide-react";

export default function ProductCard({ product, onToggleActive }) {
  const {
    name,
    price,
    image,
    sku,
    category,
    collection,
    is_active,
    gender,
    stock,
    slug,
  } = product;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <Package className="w-8 h-8" />
          </div>
        )}

        {/* Active / Inactive Status Badge */}
        <button
          onClick={() => onToggleActive && onToggleActive(product.id)}
          className="absolute top-3 left-3 z-10 cursor-pointer"
        >
          {is_active ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-white/90 backdrop-blur-md rounded-full shadow-xs border border-emerald-200 hover:bg-white transition-all">
              <Power className="w-3 h-3 text-emerald-600" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-gray-600 bg-white/90 backdrop-blur-md rounded-full shadow-xs border border-gray-200 hover:bg-white transition-all">
              <Power className="w-3 h-3 text-gray-400" />
              Inactive
            </span>
          )}
        </button>

        {/* Gender Badge if present */}
        {gender && (
          <span className="absolute top-3 right-3 z-10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-black/60 text-white backdrop-blur-xs">
            {gender}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1">
            <span className="truncate">{collection || category || "Jewelry"}</span>
            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-700">
              {sku}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-black transition-colors">
            {name}
          </h3>

          {slug && (
            <p className="text-[11px] font-mono text-gray-400 truncate mt-1">
              /{slug}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
              Price
            </span>
            <span className="text-base font-extrabold text-gray-900">
              {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : price}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
              Stock
            </span>
            <span
              className={`text-xs font-bold ${
                stock === 0
                  ? "text-red-500"
                  : stock < 5
                  ? "text-amber-500"
                  : "text-emerald-600"
              }`}
            >
              {stock} pcs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
