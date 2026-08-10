"use client";

import React, { useState } from "react";
import CustomImg from "@/components/CustomImg";
import { useSelector } from "react-redux";
import {
  LayoutGrid,
  Package,
  MessageSquare,
  Layers,
  Ticket,
  Gem,
  Ruler,
  Palette,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "products", label: "Product", icon: Package },
  { id: "collections", label: "Collection", icon: Layers },
  { id: "diamond", label: "Diamond Shapes", icon: Gem },
  { id: "ring_size", label: "Ring Size", icon: Ruler },
  { id: "carats", label: "Carat Purity", icon: Sparkles },
  { id: "gold_color", label: "Gold Color", icon: Palette },
  { id: "coupon_codes", label: "Coupon Code", icon: Ticket },
  { id: "contact_requests", label: "Contact Requests", icon: MessageSquare },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "";
  const userRole = user?.user_metadata?.role || user?.role || "user";
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2.5 rounded-xl bg-black text-white shadow-lg focus:outline-none"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-100 text-gray-800 flex flex-col justify-between shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto py-6">
          {/* Logo Header */}
          <div className="px-6 flex items-center justify-center">
            <CustomImg
              srcAttr="/logo.webp"
              altAttr="Velora Jewellers Logo"
              titleAttr="Velora Jewellers Logo"
              width={180}
              height={50}
              className="h-10 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* User Profile Section (Below Logo) */}
          <div className="px-4 mt-4 pb-2">
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#202A4E] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {userName}
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#202A4E] shrink-0" />
                </div>
                <p className="text-[11px] text-gray-500 truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-black text-white shadow-md font-semibold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
