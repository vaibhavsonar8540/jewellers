"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Filter,
  X,
  Search,
  SlidersHorizontal,
  Sparkles,
  Package,
  Loader2,
  ArrowUpDown,
  Check,
  Tag,
  Grid,
} from "lucide-react";
import CustomImg from "@/components/CustomImg";
import ProductCard from "@/components/productCard";
import { fetchActiveProductsService } from "@/lib/productService";

const makeSlug = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function ShopClient({ slugParams = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Path Parameters: /collection/[collectionSlug]/[categorySlug]/[subCategorySlug]
  const pathCollectionSlug = slugParams[0] || searchParams.get("collection") || "";
  const pathCategorySlug = slugParams[1] || searchParams.get("category") || "";
  const pathSubCategorySlug = slugParams[2] || searchParams.get("subcategory") || "";

  // Data states
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [purities, setPurities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCarat, setSelectedCarat] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch active products & master taxonomies on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchActiveProductsService();
        if (res?.data) setProducts(res.data);
        if (res?.collections) setCollections(res.collections);
        if (res?.categories) setCategories(res.categories);
        if (res?.subCategories) setSubCategories(res.subCategories);
        if (res?.colors) setColors(res.colors);
        if (res?.purities) setPurities(res.purities);
      } catch (err) {
        console.error("Failed loading shop products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Find Active Master Objects for Breadcrumbs & Filters
  const activeCollectionObj = useMemo(() => {
    if (!pathCollectionSlug) return null;
    return collections.find(
      (c) =>
        makeSlug(c.slug || c.name) === makeSlug(pathCollectionSlug) ||
        c.id === pathCollectionSlug ||
        makeSlug(c.name) === makeSlug(pathCollectionSlug)
    );
  }, [collections, pathCollectionSlug]);

  const activeCategoryObj = useMemo(() => {
    if (!pathCategorySlug) return null;
    return categories.find(
      (c) =>
        makeSlug(c.slug || c.name) === makeSlug(pathCategorySlug) ||
        c.id === pathCategorySlug ||
        makeSlug(c.name) === makeSlug(pathCategorySlug)
    );
  }, [categories, pathCategorySlug]);

  const activeSubCategoryObj = useMemo(() => {
    if (!pathSubCategorySlug) return null;
    return subCategories.find(
      (s) =>
        makeSlug(s.slug || s.name) === makeSlug(pathSubCategorySlug) ||
        s.id === pathSubCategorySlug ||
        makeSlug(s.name) === makeSlug(pathSubCategorySlug)
    );
  }, [subCategories, pathSubCategorySlug]);

  // Categories filtered by currently selected collection
  const filteredCategoriesForCollection = useMemo(() => {
    if (!activeCollectionObj) return categories;
    return categories.filter(
      (cat) =>
        cat.collection_id === activeCollectionObj.id ||
        makeSlug(cat.collection_name) === makeSlug(activeCollectionObj.name)
    );
  }, [categories, activeCollectionObj]);

  // Subcategories filtered by currently selected category
  const filteredSubCategoriesForCategory = useMemo(() => {
    if (!activeCategoryObj) return subCategories;
    return subCategories.filter(
      (sub) =>
        sub.category_id === activeCategoryObj.id ||
        makeSlug(sub.category_name) === makeSlug(activeCategoryObj.name)
    );
  }, [subCategories, activeCategoryObj]);

  // Handle URL Path Navigation Changes
  const handleCollectionSelect = (colSlug) => {
    if (!colSlug || colSlug === pathCollectionSlug) {
      router.push("/collection");
    } else {
      router.push(`/collection/${makeSlug(colSlug)}`);
    }
  };

  const handleCategorySelect = (catSlug) => {
    if (!catSlug || catSlug === pathCategorySlug) {
      if (pathCollectionSlug) {
        router.push(`/collection/${pathCollectionSlug}`);
      } else {
        router.push("/collection");
      }
    } else {
      const parentCol = pathCollectionSlug || (activeCollectionObj ? makeSlug(activeCollectionObj.slug || activeCollectionObj.name) : "all");
      router.push(`/collection/${parentCol}/${makeSlug(catSlug)}`);
    }
  };

  const handleSubCategorySelect = (subSlug) => {
    if (!subSlug || subSlug === pathSubCategorySlug) {
      if (pathCollectionSlug && pathCategorySlug) {
        router.push(`/collection/${pathCollectionSlug}/${pathCategorySlug}`);
      } else {
        router.push("/collection");
      }
    } else {
      const parentCol = pathCollectionSlug || "all";
      const parentCat = pathCategorySlug || "all";
      router.push(`/collection/${parentCol}/${parentCat}/${makeSlug(subSlug)}`);
    }
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setSelectedCarat("all");
    setSelectedColor("all");
    setPriceMin("");
    setPriceMax("");
    setSortBy("newest");
    router.push("/collection");
  };

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Collection Filter (Path based or object based)
        if (pathCollectionSlug && pathCollectionSlug !== "all") {
          const prodColSlug = makeSlug(p.collection_slug || p.collection_name);
          const targetColSlug = makeSlug(pathCollectionSlug);
          if (prodColSlug !== targetColSlug && p.collection_id !== pathCollectionSlug) {
            return false;
          }
        }

        // 2. Category Filter
        if (pathCategorySlug && pathCategorySlug !== "all") {
          const prodCatSlug = makeSlug(p.category_slug || p.category_name);
          const targetCatSlug = makeSlug(pathCategorySlug);
          if (prodCatSlug !== targetCatSlug && p.category_id !== pathCategorySlug) {
            return false;
          }
        }

        // 3. Sub-Category Filter
        if (pathSubCategorySlug && pathSubCategorySlug !== "all") {
          const prodSubSlug = makeSlug(p.sub_category_slug || p.sub_category_name);
          const targetSubSlug = makeSlug(pathSubCategorySlug);
          if (prodSubSlug !== targetSubSlug && p.sub_category_id !== pathSubCategorySlug) {
            return false;
          }
        }

        // 4. Search Term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const matches =
            p.name.toLowerCase().includes(term) ||
            (p.sku && p.sku.toLowerCase().includes(term)) ||
            (p.description && p.description.toLowerCase().includes(term));
          if (!matches) return false;
        }

        // 5. Gender Filter
        if (selectedGender !== "all") {
          if (selectedGender === "none" && p.gender) return false;
          if (selectedGender !== "none" && (!p.gender || p.gender.toLowerCase() !== selectedGender.toLowerCase())) {
            return false;
          }
        }

        // 6. Carat / Purity Filter
        if (selectedCarat !== "all") {
          if (!p.carats || !p.carats.includes(selectedCarat)) {
            return false;
          }
        }

        // 7. Metal Color Filter
        if (selectedColor !== "all") {
          const hasColor = (p.colors || []).some(
            (c) => makeSlug(c.name) === makeSlug(selectedColor) || c.id === selectedColor
          );
          if (!hasColor) return false;
        }

        // 8. Price Min & Max
        if (priceMin && p.price < parseFloat(priceMin)) return false;
        if (priceMax && p.price > parseFloat(priceMax)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [
    products,
    pathCollectionSlug,
    pathCategorySlug,
    pathSubCategorySlug,
    searchTerm,
    selectedGender,
    selectedCarat,
    selectedColor,
    priceMin,
    priceMax,
    sortBy,
  ]);

  // Page Header Title Computation
  const pageTitle = useMemo(() => {
    if (activeSubCategoryObj) return `${activeSubCategoryObj.name} Jewelry`;
    if (activeCategoryObj) return `${activeCategoryObj.name} Collection`;
    if (activeCollectionObj) return `${activeCollectionObj.name} Collection`;
    return "All Fine Jewelry Products";
  }, [activeSubCategoryObj, activeCategoryObj, activeCollectionObj]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 font-sans pb-16">
      {/* Dynamic Header & Breadcrumb Section */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider overflow-x-auto pb-1">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link
              href="/collection"
              className={`hover:text-black transition-colors ${
                !pathCollectionSlug ? "text-black font-extrabold" : ""
              }`}
            >
              Collections
            </Link>

            {activeCollectionObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <Link
                  href={`/collection/${makeSlug(activeCollectionObj.slug || activeCollectionObj.name)}`}
                  className={`hover:text-black transition-colors ${
                    !pathCategorySlug ? "text-black font-extrabold" : ""
                  }`}
                >
                  {activeCollectionObj.name}
                </Link>
              </>
            )}

            {activeCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <Link
                  href={`/collection/${pathCollectionSlug || 'all'}/${makeSlug(activeCategoryObj.slug || activeCategoryObj.name)}`}
                  className={`hover:text-black transition-colors ${
                    !pathSubCategorySlug ? "text-black font-extrabold" : ""
                  }`}
                >
                  {activeCategoryObj.name}
                </Link>
              </>
            )}

            {activeSubCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-black font-extrabold">
                  {activeSubCategoryObj.name}
                </span>
              </>
            )}
          </nav>

          {/* Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <span>{pageTitle}</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Explore luxury jewelry pieces crafted with perfection. Showing{" "}
                <span className="font-bold text-gray-900">
                  {filteredProducts.length}
                </span>{" "}
                active items.
              </p>
            </div>

            {/* Mobile Filter & Search Trigger */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ========================================== */}
          {/* LEFT SIDEBAR FILTERS (DESKTOP)             */}
          {/* ========================================== */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-6 sticky top-24">
              
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-black" />
                  <span>Filter Products</span>
                </h3>
                {(pathCollectionSlug ||
                  pathCategorySlug ||
                  pathSubCategorySlug ||
                  searchTerm ||
                  selectedCarat !== "all" ||
                  selectedColor !== "all" ||
                  selectedGender !== "all" ||
                  priceMin ||
                  priceMax) && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* 1. Search Box */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by name, SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Collections List Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Jewelry Collections
                </label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => handleCollectionSelect("")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      !pathCollectionSlug
                        ? "bg-black text-white font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>All Collections</span>
                    <span className="text-[10px] opacity-75">{products.length}</span>
                  </button>

                  {collections.map((col) => {
                    const slug = makeSlug(col.slug || col.name);
                    const isSelected = pathCollectionSlug === slug || pathCollectionSlug === col.id;
                    const count = products.filter(
                      (p) => makeSlug(p.collection_slug || p.collection_name) === slug || p.collection_id === col.id
                    ).length;

                    return (
                      <button
                        key={col.id}
                        onClick={() => handleCollectionSelect(slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-black text-white font-bold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{col.name}</span>
                        <span className="text-[10px] opacity-75">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Categories List Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Category {activeCollectionObj ? `(${activeCollectionObj.name})` : ""}
                </label>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  <button
                    onClick={() => handleCategorySelect("")}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      !pathCategorySlug
                        ? "bg-slate-100 text-black font-bold border border-slate-300"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>All Categories</span>
                  </button>

                  {filteredCategoriesForCollection.map((cat) => {
                    const slug = makeSlug(cat.slug || cat.name);
                    const isSelected = pathCategorySlug === slug || pathCategorySlug === cat.id;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white font-bold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Sub-Categories Filter */}
              {filteredSubCategoriesForCategory.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Sub-Category
                  </label>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    <button
                      onClick={() => handleSubCategorySelect("")}
                      className={`w-full text-left px-3 py-1 rounded-lg text-xs font-medium ${
                        !pathSubCategorySlug ? "font-bold text-black underline" : "text-gray-600 hover:text-black"
                      }`}
                    >
                      All Sub-Categories
                    </button>
                    {filteredSubCategoriesForCategory.map((sub) => {
                      const slug = makeSlug(sub.slug || sub.name);
                      const isSelected = pathSubCategorySlug === slug || pathSubCategorySlug === sub.id;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSubCategorySelect(slug)}
                          className={`w-full text-left px-3 py-1 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-amber-100 text-amber-900 font-bold"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Carat Purity Filter */}
              {purities.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Carat Purity (Metal)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCarat("all")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedCarat === "all"
                          ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Carats
                    </button>
                    {purities.map((p) => {
                      const val = typeof p === "string" ? p : p.carat || p.name;
                      const isSelected = selectedCarat === val;
                      return (
                        <button
                          key={p.id || val}
                          onClick={() => setSelectedCarat(isSelected ? "all" : val)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-500 text-white shadow-2xs font-extrabold"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. Metal Color Filter */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Metal Color
                  </label>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setSelectedColor("all")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        selectedColor === "all" ? "bg-gray-900 text-white font-bold" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span>All Colors</span>
                    </button>
                    {colors.map((col) => {
                      const isSelected = selectedColor === col.id || selectedColor === col.name;
                      return (
                        <button
                          key={col.id}
                          onClick={() => setSelectedColor(isSelected ? "all" : col.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                            isSelected ? "bg-gray-900 text-white font-bold" : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs"
                            style={{ backgroundColor: col.hex_code || col.hex || "#FFD700" }}
                          />
                          <span className="truncate">{col.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. Price Range Filter */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Price Range (INR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium bg-gray-50 focus:bg-white focus:outline-none focus:border-black"
                  />
                </div>
              </div>

            </div>
          </aside>

          {/* ========================================== */}
          {/* RIGHT PRODUCT GRID & SORT CONTROLS         */}
          {/* ========================================== */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Top Filter Bar: Sort & Active Chips */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Active Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Filters:
                </span>

                {pathCollectionSlug && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-xs font-bold shadow-2xs">
                    <span>{activeCollectionObj?.name || pathCollectionSlug}</span>
                    <button onClick={() => handleCollectionSelect("")} className="hover:text-red-300 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {pathCategorySlug && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-white text-xs font-bold shadow-2xs">
                    <span>{activeCategoryObj?.name || pathCategorySlug}</span>
                    <button onClick={() => handleCategorySelect("")} className="hover:text-red-300 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {pathSubCategorySlug && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold shadow-2xs">
                    <span>{activeSubCategoryObj?.name || pathSubCategorySlug}</span>
                    <button onClick={() => handleSubCategorySelect("")} className="hover:text-red-300 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCarat !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-700 text-white text-xs font-bold shadow-2xs">
                    <span>{selectedCarat}</span>
                    <button onClick={() => setSelectedCarat("all")} className="hover:text-red-300 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {!pathCollectionSlug && !pathCategorySlug && !pathSubCategorySlug && selectedCarat === "all" && (
                  <span className="text-xs text-gray-400 italic">Showing all active catalog products</span>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
                <Loader2 className="w-9 h-9 animate-spin text-black" />
                <p className="text-xs font-semibold text-gray-500">Loading active jewelry products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Package className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-lg font-serif font-bold text-gray-900">No Active Products Found</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    No active products match your selected collection, category, or filter criteria. Try clearing filters or exploring another collection.
                  </p>
                </div>
                <button
                  onClick={handleClearAllFilters}
                  className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-900 transition-all cursor-pointer shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
