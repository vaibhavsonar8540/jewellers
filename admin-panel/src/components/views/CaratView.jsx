"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Search, PackageOpen, X, Loader2, AlertCircle, MoreVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setPurities } from "@/store/slice/commonSlice";
import { fetchPuritiesAction, createPurityAction } from "@/action/common.action";

export default function CaratView() {
  const [openDialog, setOpenDialog] = useState(false);
  const [carat, setCarat] = useState("");
  const [price, setPrice] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();
  const purities = useSelector((state) => state.common.purities) || [];

  // Fetch Purities on mount
  useEffect(() => {
    const loadPurities = async () => {
      setFetching(true);
      try {
        const res = await fetchPuritiesAction();
        if (res?.data) {
          dispatch(setPurities(res.data));
        }
      } catch (err) {
        console.error("Error loading purities:", err);
      } finally {
        setFetching(false);
      }
    };

    loadPurities();
  }, [dispatch]);

  const handleClose = () => {
    setOpenDialog(false);
    setCarat("");
    setPrice("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!carat.trim()) {
      setErrorMsg("Please enter a valid carat purity (e.g. 18K, 22K).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Format carat value uppercase (e.g. 18k -> 18K)
      let formattedCarat = carat.trim().toUpperCase();
      if (!formattedCarat.endsWith("K") && !isNaN(parseInt(formattedCarat, 10))) {
        formattedCarat += "K";
      }

      const res = await createPurityAction({
        carat: formattedCarat,
        price: price ? parseFloat(price) : 0.00,
      });

      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to create carat purity.");
      } else if (res?.data) {
        dispatch(setPurities([...purities, ...res.data]));
        handleClose();
      } else {
        setErrorMsg("Unexpected response while creating carat purity.");
      }
    } catch (err) {
      console.error("Error creating carat purity:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = (purities || []).filter((p) => {
    const caratVal = typeof p === "string" ? p : p?.carat || p?.name || "";
    return caratVal.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getPurityPercentage = (caratStr) => {
    const num = parseInt(caratStr, 10);
    if (isNaN(num)) return null;
    if (num === 24) return "99.9% (Pure Gold)";
    if (num === 22) return "91.6% Purity";
    if (num === 18) return "75.0% Purity";
    if (num === 14) return "58.3% Purity";
    if (num === 10) return "41.7% Purity";
    return `${((num / 24) * 100).toFixed(1)}% Purity`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xl uppercase tracking-wide">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2>Carat Purities (Karat)</h2>
          </div>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            Manage metal carat purity master specifications catalog (e.g. 14K, 18K, 22K, 24K).
          </p>
        </div>
        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Carat Purity
        </button>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search carat purity (e.g. 18K, 22K, 24K)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
        />
      </div>

      {/* Render Data Table or Empty / Loading State */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {fetching ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading carat purities from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div className="max-w-md">
              <h3 className="font-bold text-base text-gray-900">
                {searchTerm ? "No Matching Carat Purities" : "No Carat Purities Found"}
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {searchTerm
                  ? `No carat matched "${searchTerm}". Try another search term.`
                  : "There are no carat purities configured yet. Add carat specifications (e.g. 14K, 18K, 22K, 24K) to configure jewelry products."}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={() => setOpenDialog(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 shadow-sm transition-all mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Carat Purity
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">CARAT SPECIFICATION</th>
                <th className="px-6 py-4">ESTIMATED PURITY LEVEL</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filtered.map((item, index) => {
                const caratText = typeof item === "string" ? item : item?.carat || item?.name || "18K";
                const purityPerc = getPurityPercentage(caratText);

                return (
                  <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold bg-amber-50 text-amber-900 rounded-lg border border-amber-200/80 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {caratText}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {purityPerc ? (
                        <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-semibold">
                          {purityPerc}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Standard Purity</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Carat Purity Dialog Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-gray-900">Add New Carat Purity</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-red-600 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* 1. Carat Value Input Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Carat Purity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 18K, 22K, 24K, 14K"
                  value={carat}
                  onChange={(e) => setCarat(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Enter gold/platinum karat purity specification (e.g., 18K or 22K).
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !carat.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading ? "Creating..." : "Create Carat Purity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
