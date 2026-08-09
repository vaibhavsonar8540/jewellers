"use client";

import React, { useState } from "react";
import { Layers, Grid, ListFilter } from "lucide-react";
import CollectionsView from "@/components/views/CollectionsView";
import CategoryView from "@/components/views/CategoryView";
import SubCategoryView from "@/components/views/SubCategoryView";

export default function CollectionTabView({ initialTab = "collection", onBack }) {
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  const tabs = [
    { id: "collection", label: "Collection", icon: Layers },
    { id: "category", label: "Category", icon: Grid },
    { id: "sub_category", label: "Sub Category", icon: ListFilter },
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
        {activeSubTab === "collection" && <CollectionsView onBack={onBack} />}
        {activeSubTab === "category" && <CategoryView onBack={onBack} />}
        {activeSubTab === "sub_category" && <SubCategoryView onBack={onBack} />}
      </div>
    </div>
  );
}
