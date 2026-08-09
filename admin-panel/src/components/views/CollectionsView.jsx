"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, MoreVertical, Layers, X, Upload, Loader2, AlertCircle, Search } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setCollection } from "@/store/slice/commonSlice";
import { createCollection, fetchCollectionsAction } from "@/action/common.action";

export default function CollectionsView() {
  const [openDialough, setOpenDialough] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const collections = useSelector((state) => state.common.collection) || [];

  // Fetch collections from Supabase database on mount/refresh
  useEffect(() => {
    const loadCollections = async () => {
      setFetching(true);
      try {
        const res = await fetchCollectionsAction();
        if (res?.data) {
          dispatch(setCollection(res.data));
        }
      } catch (err) {
        console.error("Error loading collections:", err);
      } finally {
        setFetching(false);
      }
    };

    loadCollections();
  }, [dispatch]);

  const filteredCollections = collections.filter((c) =>
    c?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c?.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setOpenDialough(false);
    setName("");
    setImageFile(null);
    setPreviewUrl(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await createCollection({ name, imageFile });
      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to create collection.");
      } else if (res?.data) {
        dispatch(setCollection([...collections, ...res.data]));
        handleClose();
      } else {
        setErrorMsg("Unexpected response received while creating collection.");
      }
    } catch (error) {
      console.error("Failed to create collection:", error);
      setErrorMsg(error.message || "An error occurred while creating collection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={"/"}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <h2 className="text-xl font-bold tracking-wide text-gray-900 uppercase">
            COLLECTIONS
          </h2>
        </div>

        <button 
          onClick={() => setOpenDialough(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Collection
        </button>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search collection by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {fetching ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Loading collections from database...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {collections.length === 0 ? "No Collections Found" : `No collections matching "${searchTerm}"`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {collections.length === 0
                ? "There are no collections created yet. Add a new collection to populate your catalog."
                : "Try adjusting your search query or add a new collection."}
            </p>
            {collections.length === 0 && (
              <button
                onClick={() => setOpenDialough(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Collection
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">COLLECTION NAME</th>
                <th className="px-6 py-4">SLUG</th>
                <th className="px-6 py-4">IMAGE</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredCollections.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-6 py-4 text-gray-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded-md">
                      {item.slug || item.name?.toLowerCase().replace(/\s+/g, "-")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <span className="text-xs text-gray-400 italic">No image</span>
                    )}
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

      {/* Add Collection Dialog Modal */}
      {openDialough && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add New Collection</h3>
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
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bridal Jewellery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Collection Image
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
                        Click to select or drag & drop an image
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
                  {loading ? "Creating..." : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
