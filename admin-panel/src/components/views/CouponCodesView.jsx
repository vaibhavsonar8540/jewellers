"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, Plus, MoreVertical, Ticket, Percent, DollarSign, Calendar } from "lucide-react";

export default function CouponCodesView({ items = [], onAdd, onBack }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = items.filter(
    (c) =>
      c?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c?.discount?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold tracking-wide text-gray-900 uppercase">
            COUPON CODES
          </h2>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Coupon Code
        </button>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search coupon by code or value..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {items.length === 0 ? "No Coupon Codes Found" : `No coupons matching "${searchTerm}"`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {items.length === 0
                ? "There are no discount coupons created yet. Create a coupon to promote offers."
                : "Try adjusting your search criteria."}
            </p>
            {items.length === 0 && (
              <button
                onClick={onAdd}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add First Coupon
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">COUPON CODE</th>
                <th className="px-6 py-4">DISCOUNT</th>
                <th className="px-6 py-4">MIN PURCHASE</th>
                <th className="px-6 py-4">EXPIRY</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filtered.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-bold tracking-wider text-gray-900 font-mono">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                      {item.code || item.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-gray-900">
                    {item.discount || "10% OFF"}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {item.minPurchase || "No Minimum"}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {item.expiry || "Never"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === "Inactive"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {item.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
