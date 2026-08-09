"use client";

import React, { useState, useEffect } from "react";
import { Gem, Plus, Sparkles, Search, PackageOpen, X, Upload, Loader2, AlertCircle, MoreVertical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setDiamondShapes } from "@/store/slice/commonSlice";
import { fetchDiamondShapesAction, createDiamondShapeAction } from "@/action/common.action";

export default function DiamondView() {
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();
  const diamondShapes = useSelector((state) => state.common.diamondShapes) || [];

  // Fetch Diamond Shapes on mount
  useEffect(() => {
    const loadDiamondShapes = async () => {
      setFetching(true);
      try {
        const res = await fetchDiamondShapesAction();
        if (res?.data) {
          dispatch(setDiamondShapes(res.data));
        }
      } catch (err) {
        console.error("Error loading diamond shapes:", err);
      } finally {
        setFetching(false);
      }
    };

    loadDiamondShapes();
  }, [dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setName("");
    setImageFile(null);
    setPreviewUrl(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a diamond shape name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await createDiamondShapeAction({
        name: name.trim(),
        imageFile,
      });

      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to create diamond shape.");
      } else if (res?.data) {
        dispatch(setDiamondShapes([...diamondShapes, ...res.data]));
        handleClose();
      } else {
        setErrorMsg("Unexpected response while creating diamond shape.");
      }
    } catch (err) {
      console.error("Error creating diamond shape:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = diamondShapes.filter((d) =>
    d?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d?.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xl uppercase tracking-wide">
            <Gem className="w-6 h-6 text-black" />
            <h2>Diamond Shapes</h2>
          </div>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            Master reference catalog for diamond cut shapes, icon images, and attributes.
          </p>
        </div>
        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Diamond Shape
        </button>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search diamond shape by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
        />
      </div>

      {/* Render Data Grid or Empty / Loading State */}
      {fetching ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-black animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading diamond shapes from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200/80 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
            <PackageOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="font-bold text-base text-gray-900">
              {searchTerm ? "No Matching Diamond Shapes" : "No Diamond Shapes Found"}
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              {searchTerm
                ? `No diamond shape matched "${searchTerm}". Try adjusting your search query.`
                : "There are no diamond shapes created yet. Add diamond shapes (e.g. Round, Princess, Emerald, Oval) to populate your catalog."}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 shadow-sm transition-all mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add First Diamond Shape
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-800 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Gem className="w-6 h-6 text-gray-700" />
                    )}
                  </div>
                  <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-base text-gray-900 mt-4">
                  {item.name}
                </h3>
                <div className="mt-1">
                  <span className="inline-block px-2.5 py-0.5 text-[11px] font-mono bg-gray-100 text-gray-600 rounded-md">
                    {item.slug || item.name?.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Diamond Shape Dialog Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add New Diamond Shape</h3>
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Shape Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Round, Princess, Emerald, Oval, Cushion, Pear"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Shape Icon / Image Representation
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 transition-colors relative flex flex-col items-center justify-center gap-2">
                  {previewUrl ? (
                    <div className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Click to select or drag & drop a shape image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
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
                  disabled={loading || !name.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading ? "Creating..." : "Create Shape"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
