"use client";

import React, { useState } from "react";
import { Palette, Plus, Search, PackageOpen } from "lucide-react";

export default function GoldColorView() {
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-[#202A4E] font-semibold text-xl">
            <Palette className="w-6 h-6 text-[#202A4E]" />
            <h2>Gold Colors & Metal Types</h2>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Master reference for gold colors, hex color codes, and metal finishes
          </p>
        </div>
        <button
          
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#202A4E] text-white text-sm font-semibold hover:bg-[#18203d] shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Gold Color
        </button>
      </div>


      {/* Render Data or Empty State */}
      {/* {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#202A4E]/5 text-[#202A4E] flex items-center justify-center">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="font-serif font-bold text-xl text-[#202A4E]">
              {searchTerm ? "No Matching Gold Colors" : "No Gold Colors Configured"}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm
                ? `No gold color matched "${searchTerm}". Try another search term.`
                : "There are no gold colors configured yet. Add metal color references (e.g., Yellow Gold, Rose Gold, White Gold) to configure color variations."}
            </p>
          </div>
          {!searchTerm && (
            <button
             
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202A4E] text-white text-sm font-semibold hover:bg-[#18203d] shadow-md transition-all mt-2"
            >
              <Plus className="w-4 h-4" /> Add First Gold Color
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  className="h-32 w-full flex items-center justify-center relative shadow-inner"
                  style={{ backgroundColor: item.hexCode || "#E5C158" }}
                >
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-mono text-xs font-semibold tracking-wider">
                    {item.hexCode}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-bold text-lg text-[#202A4E]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">slug: {item.slug}</p>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
