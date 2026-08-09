"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Plus, MoreVertical, ListFilter, X, Loader2, AlertCircle, Layers, Grid } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setSubCategory, setCategory, setCollection } from "@/store/slice/commonSlice";
import {
  fetchSubCategoriesAction,
  createSubCategoryAction,
  fetchCategoriesAction,
  fetchCollectionsAction,
} from "@/action/common.action";

export default function SubCategoryView({ onBack }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useDispatch();
  const subCategories = useSelector((state) => state.common.subCategory) || [];
  const categories = useSelector((state) => state.common.category) || [];
  const collections = useSelector((state) => state.common.collection) || [];

  // Fetch SubCategories, Categories, & Collections on mount
  useEffect(() => {
    const loadData = async () => {
      setFetching(true);
      try {
        const [subRes, catRes, colRes] = await Promise.all([
          fetchSubCategoriesAction(),
          fetchCategoriesAction(),
          fetchCollectionsAction(),
        ]);

        if (subRes?.data) dispatch(setSubCategory(subRes.data));
        if (catRes?.data) dispatch(setCategory(catRes.data));
        if (colRes?.data) dispatch(setCollection(colRes.data));
      } catch (err) {
        console.error("Error loading subcategory view data:", err);
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Filter Categories based on selected Collection ID
  const availableCategories = categories.filter((cat) => {
    if (!collectionId) return true;
    return cat.collection_id === collectionId || cat.collections?.id === collectionId;
  });

  // Handle Collection Selection Change
  const handleCollectionChange = (e) => {
    const newColId = e.target.value;
    setCollectionId(newColId);

    // If current selected category does not belong to the newly selected collection, reset category
    if (newColId && categoryId) {
      const valid = categories.some(
        (c) => (c.collection_id === newColId || c.collections?.id === newColId) && c.id === categoryId
      );
      if (!valid) {
        setCategoryId("");
      }
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setName("");
    setCollectionId("");
    setCategoryId("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a subcategory name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await createSubCategoryAction({
        name: name.trim(),
        category_id: categoryId || null,
      });

      if (res?.error) {
        setErrorMsg(res.error.message || "Failed to create subcategory.");
      } else if (res?.data) {
        dispatch(setSubCategory([...subCategories, ...res.data]));
        handleClose();
      } else {
        setErrorMsg("Unexpected response while creating subcategory.");
      }
    } catch (err) {
      console.error("Error creating subcategory:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = subCategories.filter((sc) =>
    sc?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sc?.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sc?.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold tracking-wide text-gray-900 uppercase">
            SUB CATEGORIES
          </h2>
        </div>

        <button
          onClick={() => setOpenDialog(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Sub Category
        </button>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-1" />
        <input
          type="text"
          placeholder="Search sub category by name, category, or collection..."
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
            <p className="text-xs text-gray-500 font-medium">Loading sub categories from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
              <ListFilter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {subCategories.length === 0 ? "No Sub Categories Found" : `No sub categories matching "${searchTerm}"`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {subCategories.length === 0
                ? "There are no sub categories created yet. Add a new sub category to populate your catalog."
                : "Try adjusting your search criteria or add a new sub category."}
            </p>
            {subCategories.length === 0 && (
              <button
                onClick={() => setOpenDialog(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add First Sub Category
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">SUB CATEGORY NAME</th>
                <th className="px-6 py-4">CATEGORY</th>
                <th className="px-6 py-4">COLLECTION</th>
                <th className="px-6 py-4">SLUG</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {filtered.map((item, index) => {
                const matchedCategory =
                  item?.categories ||
                  categories.find((c) => c.id === item.category_id);

                const categoryName = matchedCategory?.name || "—";

                const matchedCollection = collections.find(
                  (col) => col.id === matchedCategory?.collection_id
                );
                const collectionName = matchedCollection?.name || "—";

                return (
                  <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                        <Grid className="w-3 h-3 text-emerald-500" />
                        {categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        <Layers className="w-3 h-3 text-blue-500" />
                        {collectionName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-mono bg-gray-100 text-gray-600 rounded-md">
                        {item.slug || item.name?.toLowerCase().replace(/\s+/g, "-")}
                      </span>
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

      {/* Add Sub Category Dialog Modal */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Add New Sub Category</h3>
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

              {/* 1. Select Collection Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Collection
                </label>
                <div className="relative">
                  <select
                    value={collectionId}
                    onChange={handleCollectionChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Collection --</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <Layers className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Select Category Box (Filtered based on Collection) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Category
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Choose Category --</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <Grid className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {collectionId && availableCategories.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No categories found for the selected collection.
                  </p>
                )}
              </div>

              {/* 3. Sub Category Name Input Box */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Sub Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diamond Solitaire Rings, Engagement Bands"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  disabled={loading || !name.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading ? "Creating..." : "Create Sub Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
