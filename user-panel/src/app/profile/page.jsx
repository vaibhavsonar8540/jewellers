"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  CheckCircle2,
  AlertCircle,
  Save,
  Package,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  Key,
} from "lucide-react";
import { supabase } from "@/lib/db";
import { selectAuthUser, selectIsAuthenticated, setUser } from "@/store/slice/authSlice";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const reduxUser = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setLocalUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      setLoading(true);
      setErrorMsg("");

      if (!supabase) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const currentSessionUser = sessionData?.session?.user || reduxUser;

        if (currentSessionUser) {
          if (isMounted) {
            setLocalUser(currentSessionUser);
            dispatch(setUser({ user: currentSessionUser, profile: null }));

            const meta = currentSessionUser.user_metadata || {};
            setFormData({
              fullName: meta.full_name || meta.name || "",
              phone: meta.phone || "",
              email: currentSessionUser.email || "",
              address: meta.address || "",
              city: meta.city || "",
              state: meta.state || "",
              pincode: meta.pincode || "",
              country: meta.country || "India",
            });
          }

          // Optionally fetch row from profiles table
          try {
            const { data: profileRow } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentSessionUser.id)
              .single();

            if (profileRow && isMounted) {
              setFormData((prev) => ({
                ...prev,
                fullName: profileRow.name || prev.fullName,
              }));
            }
          } catch (e) {
            // ignore if profiles table doesn't have row
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (!formData.fullName.trim()) {
        throw new Error("Full name is required.");
      }

      // 1. Update Supabase User Metadata
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName.trim(),
          name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
          country: formData.country.trim() || "India",
        },
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      const updatedUser = updateData?.user || user;

      // 2. Update profiles table if row exists
      try {
        await supabase
          .from("profiles")
          .update({
            name: formData.fullName.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } catch (e) {
        // ignore table update error
      }

      // 3. Update Redux Auth State
      dispatch(setUser({ user: updatedUser, profile: null }));
      setLocalUser(updatedUser);

      setSuccessMsg("Profile information updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[#202A4E] animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest font-sans text-slate-500 font-semibold">
            Loading Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 p-10 text-center max-w-md w-full space-y-6 shadow-sm">
          <User className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-serif text-slate-900">Sign In Required</h2>
            <p className="text-xs text-slate-500">
              Please sign in to view and manage your profile details.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3 bg-[#202A4E] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-800 font-medium">My Profile</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2">
        {/* Luxury Profile Header Banner */}
        <div className="bg-gradient-to-r from-[#1A2238] via-[#202A4E] to-[#1A2238] text-white p-8 sm:p-10 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border-2 border-amber-400/40 flex items-center justify-center text-amber-300 text-2xl font-serif font-bold uppercase shadow-inner shrink-0">
                {formData.fullName ? formData.fullName.charAt(0) : "U"}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono uppercase tracking-widest rounded-full">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Verified Customer</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-normal text-white">
                  {formData.fullName || "User Profile"}
                </h1>
                <p className="text-xs text-slate-300 font-mono truncate max-w-sm">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/orders"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-amber-300" />
                <span>My Orders</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-none text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg("")}
              className="text-rose-700 hover:text-rose-950 underline text-xs font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-none text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg("")}
              className="text-emerald-700 hover:text-emerald-950 underline text-xs font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Edit Profile Form Card */}
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          {/* Section 1: Personal Details */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#202A4E] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-lg font-serif text-slate-900 font-normal">
                Personal Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#202A4E] focus:bg-white rounded-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#202A4E] focus:bg-white rounded-none transition-colors"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Email Address <span className="text-slate-400 font-normal">(Account Email)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-500 cursor-not-allowed rounded-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Default Delivery & Shipping Address */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#202A4E] text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-lg font-serif text-slate-900 font-normal">
                Default Shipping Address
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Street / House Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House / Flat No., Building, Street Name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#202A4E] focus:bg-white rounded-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#202A4E] focus:bg-white rounded-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#202A4E] focus:bg-white rounded-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#202A4E] focus:bg-white rounded-none transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
