"use client";

import React from "react";
import { Power, Package, Edit3, Trash2 } from "lucide-react";

export default function ProductCard({ product, onToggleActive, onEdit, onDelete }) {
  const {
    name,
    price,
    image,
    sku,
    collection,
    is_active,
  } = product;

  return (
    <div className="relative bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Black Hover Overlay Layer across whole div */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3.5 p-4 rounded-2xl">
        {/* Active / Inactive Status Toggle Icon */}
        <button
          type="button"
          title={is_active ? "Status: Active (Click to deactivate)" : "Status: Inactive (Click to activate)"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive && onToggleActive(product.id);
          }}
          className={`w-11 h-11 rounded-full border backdrop-blur-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:scale-110 active:scale-95 ${
            is_active
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30"
              : "bg-white/10 text-gray-400 border-white/20 hover:bg-white/20 hover:text-white"
          }`}
        >
          <Power className="w-5 h-5" />
        </button>

        {/* Edit Button Icon */}
        <button
          type="button"
          title="Edit Product"
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(product);
          }}
          className="w-11 h-11 rounded-full bg-white text-black hover:bg-gray-100 shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
        >
          <Edit3 className="w-5 h-5 text-black" />
        </button>

        {/* Delete Button Icon */}
        <button
          type="button"
          title="Delete Product"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(product);
          }}
          className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        {/* Active / Inactive Status Badge on Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-xs flex items-center gap-1.5 transition-colors border ${
              is_active
                ? "bg-emerald-500/90 text-white border-emerald-400/50"
                : "bg-red-100/95 text-red-700 border-red-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                is_active ? "bg-white animate-pulse" : "bg-red-500"
              }`}
            />
            {is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <Package className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Product Details - ONLY Collection, SKU, Name, and Price */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Collection Name & SKU Badge */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-1.5">
            <span className="truncate font-semibold text-gray-600">
              {collection || "Collection"}
            </span>
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-700">
              {sku}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
            {name}
          </h3>
        </div>

        {/* Price Only */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            PRICE
          </span>
          <span className="text-base font-extrabold text-gray-900">
            {typeof price === "number" ? `₹${price.toLocaleString("en-IN")}` : price}
          </span>
        </div>
      </div>
    </div>
  );
}
