"use client";

import React, { useState, useEffect } from "react";
import { Palette, Plus, Search, PackageOpen, X, Loader2, AlertCircle, MoreVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setColors } from "@/store/slice/commonSlice";
import { fetchColorsAction, createColorAction } from "@/action/common.action";
import { sortGoldColors } from "@/service/common.service";

export default function GoldColorView() {
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("#FFD700");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();
  const colors = useSelector((state) => state.common.colors) || [];

  // Fetch Colors on mount
  useEffect(() => {
    const loadColors = async () => {
      setFetching(true);
      try {
        const res = await fetchColorsAction();
        if (res?.data) {
          dispatch(setColors(res.data));
        }
      } catch (err) {
        console.error("Error loading colors:", err);
      } finally {
        setFetching(false);
      }
    };

    loadColors();
  }, [dispatch]);

  const handleClose = () => {
    setOpenDialog(false);
    setName("");
    setHexCode("#FFD700");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a color name.");
      return;
    }

    if (!hexCode.trim()) {
      setErrorMsg("Please enter a hex color code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await createColorAction({
        name: name.trim(),
        hex_code: hexCode.trim(),
      });

      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to create color.");
      } else if (res?.data) {
        dispatch(setColors([...colors, ...res.data]));
        handleClose();
      } else {
        setErrorMsg("Unexpected response while creating color.");
      }
    } catch (err) {
      console.error("Error creating color:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = sortGoldColors(
    colors.filter(
      (c) =>
        c?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c?.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c?.hex_code?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xl uppercase tracking-wide">
            <Palette className="w-6 h-6 text-black" />
            <h2>Gold Colors & Metal Types</h2>
          </div>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            Master reference for gold colors, hex color codes, and metal finishes.
          </p>
        </div>
        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Gold Color
        </button>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search gold color by name, slug, or hex code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
        />
      </div>

      {/* Render Data Grid or Empty / Loading State */}
      {fetching ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading gold colors from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
            <PackageOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="font-bold text-base text-gray-900">
              {searchTerm ? "No Matching Gold Colors" : "No Gold Colors Configured"}
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              {searchTerm
                ? `No gold color matched "${searchTerm}". Try adjusting your search term.`
                : "There are no gold colors configured yet. Add metal color references (e.g. Yellow Gold, Rose Gold, White Gold, Platinum) to configure product attributes."}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 shadow-sm transition-all mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Gold Color
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  className="h-28 w-full flex items-center justify-center relative shadow-inner"
                  style={{ backgroundColor: item.hex_code || item.hexCode || "#E5C158" }}
                >
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-mono text-xs font-semibold tracking-wider border border-white/20">
                    {item.hex_code || item.hexCode}
                  </span>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {item.slug || item.name?.toLowerCase().replace(/\s+/g, "-")}
                    </p>
                  </div>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Gold Color Dialog Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add New Gold Color</h3>
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

              {/* 1. Color Name Input Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Color / Metal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yellow Gold, Rose Gold, White Gold, Platinum"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              {/* 2. Hex Code Input Box with Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Hex Color Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. #FFD700, #B76E79, #E5E4E2"
                      value={hexCode}
                      onChange={(e) => setHexCode(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                    />
                  </div>
                  <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-xs cursor-pointer">
                    <input
                      type="color"
                      value={hexCode.startsWith("#") ? hexCode : `#${hexCode}`}
                      onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer border-0"
                    />
                  </div>
                </div>
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
                  disabled={loading || !name.trim() || !hexCode.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading ? "Creating..." : "Create Gold Color"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
