"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, SlidersHorizontal, X, Loader2, AlertCircle, Search } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setCustomizeTypes } from "@/store/slice/commonSlice";
import {
  fetchCustomizeTypesAction,
  createCustomizeTypeAction,
  updateCustomizeTypeAction,
  deleteCustomizeTypeAction,
} from "@/action/common.action";

export default function CustomizeTypesView({ onBack }) {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const customizeTypes = useSelector((state) => state.common.customizeTypes) || [];

  // Load customize types on mount
  const loadCustomizeTypes = async () => {
    setFetching(true);
    try {
      const res = await fetchCustomizeTypesAction();
      if (res?.data) {
        dispatch(setCustomizeTypes(res.data));
      }
    } catch (err) {
      console.error("Error loading customize types:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadCustomizeTypes();
  }, [dispatch]);

  const filteredTypes = customizeTypes.filter((t) =>
    t?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClose = () => {
    setOpenAddModal(false);
    setEditingItem(null);
    setDeletingId(null);
    setTitle("");
    setErrorMsg("");
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (editingItem) {
        const res = await updateCustomizeTypeAction({ id: editingItem.id, title: title.trim() });
        if (res?.error) {
          setErrorMsg(res.error.message || "Failed to update customization type.");
        } else {
          await loadCustomizeTypes();
          handleClose();
        }
      } else {
        const res = await createCustomizeTypeAction({ title: title.trim() });
        if (res?.error) {
          setErrorMsg(res.error.message || "Failed to create customization type.");
        } else {
          await loadCustomizeTypes();
          handleClose();
        }
      }
    } catch (error) {
      console.error("Failed to save customization type:", error);
      setErrorMsg(error.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setLoading(true);
    try {
      const res = await deleteCustomizeTypeAction(deletingId);
      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to delete customization type.");
      } else {
        await loadCustomizeTypes();
        handleClose();
      }
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg(err.message || "Error deleting customization type.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div>
            <h2 className="text-xl font-bold tracking-wide text-gray-900 uppercase flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-black" /> CUSTOMIZATION TYPES
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage root customization groups (e.g., Karat Purity, Metal Color, Diamond Shape)
            </p>
          </div>
        </div>

        <button
          onClick={() => setOpenAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Customization Type
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search customization type by title..."
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
            <p className="text-xs text-gray-500 font-medium">Loading customization types...</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {customizeTypes.length === 0 ? "No Customization Types Found" : `No types matching "${searchTerm}"`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {customizeTypes.length === 0
                ? "There are no customization types created yet. Add your first customization type group."
                : "Try adjusting your search term or add a new customization type."}
            </p>
            {customizeTypes.length === 0 && (
              <button
                onClick={() => setOpenAddModal(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Type
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">TITLE</th>
                <th className="px-6 py-4">CREATED DATE</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredTypes.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }) : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Edit Type"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Type"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Dialog Modal */}
      {(openAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingItem ? "Edit Customization Type" : "Add Customization Type"}
              </h3>
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
                  Type Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karat Purity, Metal Color, Ring Size"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
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
                  disabled={loading || !title.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading
                    ? editingItem
                      ? "Updating..."
                      : "Creating..."
                    : editingItem
                    ? "Update Type"
                    : "Create Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Delete Customization Type?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete this customization type? All associated sub customization options will also be permanently removed.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
