"use client";

import React, { useState } from "react";
import { Palette, Sparkles, Gem } from "lucide-react";
import GoldColorView from "@/components/views/GoldColorView";
import CaratView from "@/components/views/CaratView";
import DiamondView from "@/components/views/DiamondView";

export default function CustomizeTabView({ initialTab = "gold_color", onBack }) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  const tabs = [
    { id: "gold_color", label: "Gold Colors", icon: Palette },
    { id: "karat", label: "Gold Karats", icon: Sparkles },
    { id: "diamond_shapes", label: "Diamond Shapes", icon: Gem },
  ];

  return (
    <div className="space-y-6">
      {/* Top Tab Navigation Bar */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panel Content */}
      <div>
        {activeSubTab === "gold_color" && <GoldColorView onBack={onBack} />}
        {activeSubTab === "karat" && <CaratView onBack={onBack} />}
        {activeSubTab === "diamond_shapes" && <DiamondView onBack={onBack} />}
      </div>
    </div>
  );
}
