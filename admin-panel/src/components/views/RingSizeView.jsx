"use client";

import React, { useState } from "react";
import { Ruler, Plus, Search, PackageOpen } from "lucide-react";

export default function RingSizeView({ items = [], onAdd }) {
  const [searchTerm, setSearchTerm] = useState("");

  const ringSizes = items || [];
  const filtered = ringSizes.filter((r) =>
    r?.usSize?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-[#202A4E] font-semibold text-xl">
            <Ruler className="w-6 h-6 text-[#202A4E]" />
            <h2>Ring Size Reference</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Standard US ring sizes, inner diameter (mm), and inner circumference (mm)
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202A4E] text-white text-sm font-semibold hover:bg-[#18203d] shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Ring Size
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search US Size (e.g. 7)..."
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
              {searchTerm ? "No Matching Ring Sizes" : "No Ring Sizes Found"}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm
                ? `No ring size matched "${searchTerm}". Try searching another size.`
                : "There are no ring sizes configured yet. Add ring size specifications (e.g., US 5, US 6, US 7) to configure ring options."}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202A4E] text-white text-sm font-semibold hover:bg-[#18203d] shadow-md transition-all mt-2"
            >
              <Plus className="w-4 h-4" /> Add First Ring Size
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">US Size</th>
                <th className="px-6 py-4">Inner Diameter (mm)</th>
                <th className="px-6 py-4">Circumference (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtered.map((size) => (
                <tr key={size.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-[#202A4E]">
                    US {size.usSize}
                  </td>
                  <td className="px-6 py-4">{size.innerDiameter}</td>
                  <td className="px-6 py-4">{size.circumference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
