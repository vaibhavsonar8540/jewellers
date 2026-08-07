"use client";

import React, { useState } from "react";
import { Gem, Plus, Sparkles, Search, PackageOpen } from "lucide-react";

export default function DiamondView({ items = [], onAdd }) {
  const [searchTerm, setSearchTerm] = useState("");

  const diamondShapes = items || [];
  const filtered = diamondShapes.filter((d) =>
    d?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-[#202A4E] font-semibold text-xl">
            <Gem className="w-6 h-6 text-[#202A4E]" />
            <h2>Diamond Shapes</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Master reference table for diamond cut shapes and icon representations
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202A4E] text-white text-sm font-semibold hover:bg-[#18203d] shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Diamond Shape
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search diamond shape..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#202A4E]/20 focus:border-[#202A4E]"
        />
      </div>

      {/* Render Data or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#202A4E]/5 text-[#202A4E] flex items-center justify-center">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="font-serif font-bold text-xl text-[#202A4E]">
              {searchTerm ? "No Matching Diamond Shapes" : "No Diamond Shapes Found"}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm
                ? `No diamond shape matched "${searchTerm}". Try another search term.`
                : "There are no diamond shapes created yet. Add diamond shapes (e.g., Round, Princess, Emerald) to configure product attributes."}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202A4E] text-white text-sm font-semibold hover:bg-[#18203d] shadow-md transition-all mt-2"
            >
              <Plus className="w-4 h-4" /> Add First Diamond Shape
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#202A4E]/5 flex items-center justify-center text-[#202A4E]">
                    <Gem className="w-6 h-6" />
                  </div>
                  {item.popularity && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold flex items-center gap-1 border border-amber-200">
                      <Sparkles className="w-3 h-3" /> {item.popularity}
                    </span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-lg text-[#202A4E] mt-4">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">slug: {item.slug}</p>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  {item.description || "No description provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
