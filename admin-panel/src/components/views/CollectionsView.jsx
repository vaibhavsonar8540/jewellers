"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus, MoreVertical, Layers, X, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../Buttons";
import { useDispatch, useSelector } from "react-redux";
import { setCollection } from "@/store/slice/commonSlice";
import { createCollection } from "@/action/common.action";

export default function CollectionsView() {
  const [openDialough, setOpenDialough] = useState(false);
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const collections = useSelector((state) => state.common.collection) || [];

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await createCollection({ name, imageFile });
      if (res?.data) {
        dispatch(setCollection([...collections, ...res.data]));
        handleClose();
      }
    } catch (error) {
      console.error("Failed to create collection:", error);
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

        <Button 
          onClick={() => setOpenDialough(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Collection
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {collections.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              No Collections Found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              There are no collections created yet. Add a new collection to populate your catalog.
            </p>
            <button
              onClick={() => setOpenDialough(true)}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add First Collection
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">COLLECTION NAME</th>
                <th className="px-6 py-4">IMAGE</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {collections.map((item, index) => (
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
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <span className="text-xs text-gray-400 italic">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
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
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black transition-colors"
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm"
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

