"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/views/DashboardView";
import CollectionsView from "@/components/views/CollectionsView";
import CategoryView from "@/components/views/CategoryView";
import SubCategoryView from "@/components/views/SubCategoryView";
import DiamondView from "@/components/views/DiamondView";
import RingSizeView from "@/components/views/RingSizeView";
import GoldColorView from "@/components/views/GoldColorView";
import ContactRequestsView from "@/components/views/ContactRequestsView";
import CouponCodesView from "@/components/views/CouponCodesView";
import AuthView from "@/components/views/AuthView";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearAuth, setAuthLoading } from "@/store/slice/authSlice";
import { checkAuthSessionAction, logoutUserAction } from "@/action/auth.action";
import { LogOut, AlertCircle, Plus, X, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // Check auth session on initial load
  useEffect(() => {
    const initAuth = async () => {
      dispatch(setAuthLoading(true));
      const { user: sessionUser } = await checkAuthSessionAction();
      if (sessionUser) {
        dispatch(setUser(sessionUser));
      } else {
        dispatch(clearAuth());
      }
    };
    initAuth();
  }, [dispatch]);

  // Dynamic Data Lists
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);


  const [diamondShapes, setDiamondShapes] = useState([]);
  const [ringSizes, setRingSizes] = useState([]);
  const [goldColors, setGoldColors] = useState([]);

  const [contactRequests, setContactRequests] = useState([
    {
      id: "1",
      name: "Ananya Sharma",
      email: "ananya@example.com",
      phone: "+91 98765 43210",
      message: "Inquiry about custom diamond solitaire ring custom engraving.",
      date: "Today, 10:30 AM",
      status: "Pending",
    },
    {
      id: "2",
      name: "Rohan Verma",
      email: "rohan.v@example.com",
      phone: "+91 98123 45678",
      message: "Request for booking an in-person bridal jewelry appointment.",
      date: "Yesterday",
      status: "Responded",
    },
    {
      id: "3",
      name: "Priya Patel",
      email: "priya.p@example.com",
      phone: "+91 97654 32109",
      message: "Question regarding international shipping and insurance.",
      date: "05 Aug 2026",
      status: "Pending",
    },
  ]);

  const [couponCodes, setCouponCodes] = useState([
    {
      id: "1",
      code: "WELCOME10",
      name: "WELCOME10",
      discount: "10% OFF",
      minPurchase: "₹5,000",
      expiry: "31 Dec 2026",
      status: "Active",
    },
    {
      id: "2",
      code: "FESTIVE20",
      name: "FESTIVE20",
      discount: "20% OFF",
      minPurchase: "₹25,000",
      expiry: "15 Nov 2026",
      status: "Active",
    },
    {
      id: "3",
      code: "LUXURY5000",
      name: "LUXURY5000",
      discount: "₹5,000 OFF",
      minPurchase: "₹100,000",
      expiry: "30 Sep 2026",
      status: "Active",
    },
  ]);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logoutUserAction();
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(clearAuth());
    }
  };

  const handleOpenAddModal = () => {
    setNewItemName("");
    setShowAddModal(true);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = { id: `${activeTab}-${Date.now()}`, name: newItemName };

    if (activeTab === "collections") {
      setCollections((prev) => [...prev, newItem]);
    } else if (activeTab === "categories") {
      setCategories((prev) => [...prev, newItem]);
    } else if (activeTab === "sub_categories") {
      setSubCategories((prev) => [...prev, newItem]);
    } else if (activeTab === "diamond") {
      setDiamondShapes((prev) => [...prev, newItem]);
    } else if (activeTab === "ring_size") {
      setRingSizes((prev) => [
        ...prev,
        {
          id: newItem.id,
          usSize: newItemName,
          innerDiameter: "16.5 mm",
          circumference: "51.8 mm",
        },
      ]);
    } else if (activeTab === "gold_color") {
      setGoldColors((prev) => [
        ...prev,
        {
          id: newItem.id,
          name: newItemName,
          hexCode: "#E5C158",
          slug: newItemName.toLowerCase(),
        },
      ]);
    } else if (activeTab === "coupon_codes") {
      setCouponCodes((prev) => [
        ...prev,
        {
          id: newItem.id,
          code: newItemName.toUpperCase(),
          name: newItemName.toUpperCase(),
          discount: "15% OFF",
          minPurchase: "₹10,000",
          expiry: "31 Dec 2026",
          status: "Active",
        },
      ]);
    }

    setShowAddModal(false);
  };

  const counts = {
    contact_requests: contactRequests.length,
    sellers: 3,
    collections: collections.length,
    categories: categories.length,
    sub_categories: subCategories.length,
    diamond: diamondShapes.length,
    ring_size: ringSizes.length,
    gold_color: goldColors.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#202A4E] animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthView />;
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* 1. Sidebar Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <main className="p-6 md:p-10 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === "dashboard" && <DashboardView counts={counts} />}
          {activeTab === "contact_requests" && (
            <ContactRequestsView
              items={contactRequests}
              onBack={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "collections" && (
            <CollectionsView
              items={collections}
              onAdd={handleOpenAddModal}
              onBack={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "categories" && (
            <CategoryView
              items={categories}
              onAdd={handleOpenAddModal}
              onBack={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "sub_categories" && (
            <SubCategoryView
              items={subCategories}
              onAdd={handleOpenAddModal}
              onBack={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "coupon_codes" && (
            <CouponCodesView
              items={couponCodes}
              onAdd={handleOpenAddModal}
              onBack={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "diamond" && (
            <DiamondView items={diamondShapes} onAdd={handleOpenAddModal} />
          )}
          {activeTab === "ring_size" && (
            <RingSizeView items={ringSizes} onAdd={handleOpenAddModal} />
          )}
          {activeTab === "gold_color" && (
            <GoldColorView items={goldColors} onAdd={handleOpenAddModal} />
          )}
        </main>
      </div>

      {/* 3. Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 capitalize">
                  Add {activeTab.replace("_", " ")}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Name / Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter name or code..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-black text-sm font-semibold text-white hover:bg-gray-900 shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to log out?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
