"use client";

import React, { useState, useEffect } from "react";
import { Ruler, Plus, Search, PackageOpen, X, Loader2, AlertCircle, MoreVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setRingSizes } from "@/store/slice/commonSlice";
import { fetchRingSizesAction, createRingSizeAction } from "@/action/common.action";

export default function RingSizeView() {
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [sizeInMm, setSizeInMm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();
  const ringSizes = useSelector((state) => state.common.ringSizes) || [];

  // Fetch Ring Sizes on mount
  useEffect(() => {
    const loadRingSizes = async () => {
      setFetching(true);
      try {
        const res = await fetchRingSizesAction();
        if (res?.data) {
          dispatch(setRingSizes(res.data));
        }
      } catch (err) {
        console.error("Error loading ring sizes:", err);
      } finally {
        setFetching(false);
      }
    };

    loadRingSizes();
  }, [dispatch]);

  const handleClose = () => {
    setOpenDialog(false);
    setName("");
    setSizeInMm("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sizeInMm || isNaN(parseFloat(sizeInMm))) {
      setErrorMsg("Please enter a valid size in mm (e.g. 16.5).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const finalName = name.trim() || `${sizeInMm} mm`;
      const res = await createRingSizeAction({
        name: finalName,
        size_in_mm: parseFloat(sizeInMm),
      });

      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to create ring size.");
      } else if (res?.data) {
        dispatch(setRingSizes([...ringSizes, ...res.data]));
        handleClose();
      } else {
        setErrorMsg("Unexpected response while creating ring size.");
      }
    } catch (err) {
      console.error("Error creating ring size:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = ringSizes.filter((r) =>
    r?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r?.size_in_mm?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xl uppercase tracking-wide">
            <Ruler className="w-6 h-6 text-black" />
            <h2>Ring Sizes (MM)</h2>
          </div>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            Standard ring size reference catalog in millimeter (mm) dimensions.
          </p>
        </div>
        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Ring Size
        </button>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search ring size by name or mm value (e.g. 16.5)..."
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
            <p className="text-xs text-gray-500 font-medium">Loading ring sizes from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div className="max-w-md">
              <h3 className="font-bold text-base text-gray-900">
                {searchTerm ? "No Matching Ring Sizes" : "No Ring Sizes Found"}
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                {searchTerm
                  ? `No ring size matched "${searchTerm}". Try another search term.`
                  : "There are no ring sizes configured yet. Add ring size specifications in mm (e.g. 14.0 mm, 16.5 mm, 18.0 mm) to configure ring products."}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={() => setOpenDialog(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 shadow-sm transition-all mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Ring Size
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">RING SIZE NAME</th>
                <th className="px-6 py-4">SIZE IN MM</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filtered.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {item.name || `${item.size_in_mm} mm`}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                      {item.size_in_mm} mm
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Ring Size Dialog Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add New Ring Size</h3>
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

              {/* 1. Size in MM Input Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Ring Size in MM <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 14.0, 16.5, 18.0"
                  value={sizeInMm}
                  onChange={(e) => setSizeInMm(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              {/* 2. Display Name / Label Input Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Display Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 16.5 mm or US 7 (17.3 mm)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  If left empty, defaults automatically to "{sizeInMm || "X"} mm".
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
                  disabled={loading || !sizeInMm}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading ? "Creating..." : "Create Ring Size"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
