"use client";

import React from "react";
import { MessageSquare, Store, Layers, Grid, ListFilter } from "lucide-react";

export default function DashboardView({ counts = {} }) {
  const metrics = [
    {
      id: "contact_requests",
      label: "CONTACT REQUESTS",
      count: counts.contact_requests ?? 3,
      bgColor: "bg-[#EEF2FF]",
      borderColor: "border-indigo-100",
      iconBg: "bg-[#4F46E5]",
      textColor: "text-[#4F46E5]",
      subTextColor: "text-indigo-400",
      icon: MessageSquare,
    },
    {
      id: "sellers",
      label: "SELLERS",
      count: counts.sellers ?? 3,
      bgColor: "bg-[#EFF6FF]",
      borderColor: "border-blue-100",
      iconBg: "bg-[#2563EB]",
      textColor: "text-[#2563EB]",
      subTextColor: "text-blue-400",
      icon: Store,
    },
    {
      id: "collections",
      label: "COLLECTIONS",
      count: counts.collections ?? 7,
      bgColor: "bg-[#FEFCE8]",
      borderColor: "border-amber-100",
      iconBg: "bg-[#D97706]",
      textColor: "text-[#D97706]",
      subTextColor: "text-amber-500",
      icon: Layers,
    },
    {
      id: "categories",
      label: "CATEGORIES",
      count: counts.categories ?? 15,
      bgColor: "bg-[#ECFDF5]",
      borderColor: "border-emerald-100",
      iconBg: "bg-[#059669]",
      textColor: "text-[#059669]",
      subTextColor: "text-emerald-500",
      icon: Grid,
    },
    {
      id: "sub_categories",
      label: "SUB CATEGORIES",
      count: counts.sub_categories ?? 13,
      bgColor: "bg-[#FFF1F2]",
      borderColor: "border-rose-100",
      iconBg: "bg-[#E11D48]",
      textColor: "text-[#E11D48]",
      subTextColor: "text-rose-400",
      icon: ListFilter,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          Hi, Welcome back 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          Here is a quick snapshot of your e-commerce operations dashboard.
        </p>
      </div>

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {metrics.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`${card.bgColor} ${card.borderColor} border rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xl font-bold ${card.textColor}`}>
                  {card.count}
                </span>
              </div>

              <div className="mt-8">
                <span className={`text-[11px] font-bold tracking-wider ${card.subTextColor} uppercase block`}>
                  {card.label}
                </span>
                <span className={`text-4xl font-extrabold ${card.textColor} mt-1 block`}>
                  {card.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
