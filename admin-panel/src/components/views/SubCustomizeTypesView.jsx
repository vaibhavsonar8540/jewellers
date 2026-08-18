"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, Layers, X, Upload, Loader2, AlertCircle, Search, ImageIcon, Palette } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSubCustomizationTypes, setCustomizeTypes } from "@/store/slice/commonSlice";
import {
  fetchSubCustomizationTypesAction,
  fetchCustomizeTypesAction,
  createSubCustomizationTypeAction,
  updateSubCustomizationTypeAction,
  deleteSubCustomizationTypeAction,
} from "@/action/common.action";

const COLOR_PRESETS = [
  { name: "Yellow Gold", hex: "#E5C158" },
  { name: "Rose Gold", hex: "#E6C7C2" },
  { name: "White Gold", hex: "#E5E4E2" },
  { name: "Platinum", hex: "#D9D9D9" },
  { name: "Silver", hex: "#C0C0C0" },
];

export default function SubCustomizeTypesView({ onBack }) {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [text, setText] = useState("");
  const [customizeTypeId, setCustomizeTypeId] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const subCustomizationTypes = useSelector((state) => state.common.subCustomizationTypes) || [];
  const customizeTypes = useSelector((state) => state.common.customizeTypes) || [];

  // Load sub customization types and customize types on mount
  const loadData = async () => {
    setFetching(true);
    try {
      const [subRes, typeRes] = await Promise.all([
        fetchSubCustomizationTypesAction(),
        fetchCustomizeTypesAction(),
      ]);

      if (subRes?.data) {
        dispatch(setSubCustomizationTypes(subRes.data));
      }
      if (typeRes?.data) {
        dispatch(setCustomizeTypes(typeRes.data));
      }
    } catch (err) {
      console.error("Error loading sub customization types:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const selectedType = customizeTypes.find((t) => t.id === customizeTypeId);
  const isColorType = selectedType
    ? /color|gold|metal|purity/i.test(selectedType.title)
    : true; // default to true so user can always set hex code if desired

  const filteredSubTypes = subCustomizationTypes.filter((item) => {
    const textMatch = item?.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const parentTitle = item?.customize_types?.title || "";
    const parentMatch = parentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const hexMatch = item?.hex_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return textMatch || parentMatch || hexMatch;
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setOpenAddModal(false);
    setEditingItem(null);
    setDeletingId(null);
    setText("");
    setCustomizeTypeId("");
    setHexCode("");
    setImageFile(null);
    setPreviewUrl(null);
    setErrorMsg("");
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setText(item.text);
    setCustomizeTypeId(item.customize_types_id || item.customize_types?.id || "");
    setHexCode(item.hex_code || "");
    setPreviewUrl(item.img || null);
    setImageFile(null);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg("Option text is required.");
      return;
    }
    if (!customizeTypeId) {
      setErrorMsg("Please select a Customization Type.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (editingItem) {
        const res = await updateSubCustomizationTypeAction({
          id: editingItem.id,
          text: text.trim(),
          img: previewUrl && !imageFile ? previewUrl : null,
          hex_code: hexCode.trim() || null,
          imageFile,
          customize_types_id: customizeTypeId,
        });

        if (res?.error) {
          setErrorMsg(res.error.message || "Failed to update sub customization type.");
        } else {
          await loadData();
          handleClose();
        }
      } else {
        const res = await createSubCustomizationTypeAction({
          text: text.trim(),
          img: null,
          hex_code: hexCode.trim() || null,
          imageFile,
          customize_types_id: customizeTypeId,
        });

        if (res?.error) {
          setErrorMsg(res.error.message || "Failed to create sub customization type.");
        } else {
          await loadData();
          handleClose();
        }
      }
    } catch (error) {
      console.error("Failed to save sub customization type:", error);
      setErrorMsg(error.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setLoading(true);
    try {
      const res = await deleteSubCustomizationTypeAction(deletingId);
      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to delete sub customization type.");
      } else {
        await loadData();
        handleClose();
      }
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMsg(err.message || "Error deleting sub customization type.");
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
              <Layers className="w-5 h-5 text-black" /> CUSTOMIZATION SUB TYPES
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage options under customization groups (e.g. Yellow Gold, 18K Gold, Round Cut)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (customizeTypes.length > 0) setCustomizeTypeId(customizeTypes[0].id);
            setOpenAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Sub Customization Type
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search by option text, customization type, or hex code..."
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
            <p className="text-xs text-gray-500 font-medium">Loading customization sub types...</p>
          </div>
        ) : filteredSubTypes.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {subCustomizationTypes.length === 0
                ? "No Sub Customization Options Found"
                : `No sub types matching "${searchTerm}"`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {subCustomizationTypes.length === 0
                ? "There are no sub customization options created yet. Add options to populate customization choices."
                : "Try adjusting your search query or add a new sub customization type."}
            </p>
            {subCustomizationTypes.length === 0 && (
              <button
                onClick={() => {
                  if (customizeTypes.length > 0) setCustomizeTypeId(customizeTypes[0].id);
                  setOpenAddModal(true);
                }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Option
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">OPTION TEXT</th>
                <th className="px-6 py-4">CUSTOMIZATION TYPE</th>
                <th className="px-6 py-4">COLOR / HEX CODE</th>
                <th className="px-6 py-4">IMAGE</th>
                <th className="px-6 py-4">CREATED DATE</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filteredSubTypes.map((item, index) => {
                const parentType = item.customize_types?.title ||
                  customizeTypes.find((ct) => ct.id === item.customize_types_id)?.title ||
                  "Unassigned";

                return (
                  <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.text}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg">
                        {parentType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.hex_code ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-300 shadow-xs shrink-0"
                            style={{ backgroundColor: item.hex_code }}
                          />
                          <span className="font-mono text-xs text-gray-600 font-medium">
                            {item.hex_code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.text}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Edit Option"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Option"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Dialog Modal */}
      {(openAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingItem ? "Edit Sub Customization Type" : "Add Sub Customization Type"}
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
                  Customization Type Group <span className="text-red-500">*</span>
                </label>
                <select
                  value={customizeTypeId}
                  onChange={(e) => setCustomizeTypeId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white"
                >
                  <option value="" disabled>
                    Select Customization Type...
                  </option>
                  {customizeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.title}
                    </option>
                  ))}
                </select>
                {customizeTypes.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No Customization Types found. Please create a Customization Type first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Option Text / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 18K Gold, Yellow Gold, Emerald Cut"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              {/* Color Hex Code Input Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-gray-600" /> Color Hex Code (Optional)
                  </label>
                  {hexCode && (
                    <span className="text-[11px] font-mono text-gray-500 font-semibold">{hexCode}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl border border-gray-200 shrink-0 relative overflow-hidden flex items-center justify-center cursor-pointer shadow-xs"
                    style={{ backgroundColor: hexCode || "#FFFFFF" }}
                  >
                    <input
                      type="color"
                      value={hexCode && /^#[0-9A-F]{6}$/i.test(hexCode) ? hexCode : "#E5C158"}
                      onChange={(e) => setHexCode(e.target.value.toUpperCase())}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. #E5C158 for Yellow Gold"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all uppercase font-mono"
                  />
                </div>

                {/* Quick Presets */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-gray-500 font-medium">Quick Presets:</span>
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setHexCode(preset.hex);
                        if (!text) setText(preset.name);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-gray-300"
                        style={{ backgroundColor: preset.hex }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Option Image (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-gray-300 transition-colors relative flex flex-col items-center justify-center gap-2">
                  {previewUrl ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl(null);
                        }}
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
                  disabled={loading || !text.trim() || !customizeTypeId}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading
                    ? editingItem
                      ? "Updating..."
                      : "Creating..."
                    : editingItem
                    ? "Update Option"
                    : "Create Option"}
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
              <h3 className="font-bold text-lg text-gray-900">Delete Sub Customization Option?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete this customization option? This action cannot be undone.
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
