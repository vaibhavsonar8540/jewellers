"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Filter,
  X,
  Search,
  Sparkles,
  Package,
  Loader2,
  Tag,
  RotateCcw,
  Check,
} from "lucide-react";
import ProductCard from "@/components/productCard";
import { fetchActiveProductsService } from "@/lib/productService";

const makeSlug = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// Custom Luxury Select Component matching E-Commerce Theme
function CustomSelect({ label, value, options, onChange, placeholder = "Select...", disabled = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full h-[42px] px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all shadow-2xs ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : open
            ? "bg-white border-black ring-2 ring-black/10 text-gray-900"
            : "bg-gray-50/70 border-gray-200 text-gray-900 hover:bg-white hover:border-gray-300 cursor-pointer"
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-black" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto py-1.5 animate-in fade-in duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#1E2E48] text-white font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-black"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [loading, setLoading] = useState(true);

  // Active Applied Filter States
  const urlSearchQuery = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const [selectedGender, setSelectedGender] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (urlSearchQuery) {
      setSearchTerm(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Staged Filter States for Apply/Clear Buttons
  const [tempCategorySlug, setTempCategorySlug] = useState("");
  const [tempSubCategorySlug, setTempSubCategorySlug] = useState("");
  const [tempSortBy, setTempSortBy] = useState("newest");

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
    if (collections.length === 0) return null;
    if (pathCollectionSlug && pathCollectionSlug !== "all") {
      const targetSlug = makeSlug(pathCollectionSlug);
      const found = collections.find(
        (c) =>
          c.id === pathCollectionSlug ||
          makeSlug(c.slug || c.name) === targetSlug ||
          makeSlug(c.name) === targetSlug ||
          (targetSlug.includes("jewel") && makeSlug(c.name).includes("jewel"))
      );
      if (found) return found;
    }
    return collections[0] || null;
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

  // Keep staged filter values in sync when path parameters or active objects change
  useEffect(() => {
    setTempCategorySlug(
      pathCategorySlug ? makeSlug(activeCategoryObj?.slug || activeCategoryObj?.name || pathCategorySlug) : ""
    );
    setTempSubCategorySlug(
      pathSubCategorySlug ? makeSlug(activeSubCategoryObj?.slug || activeSubCategoryObj?.name || pathSubCategorySlug) : ""
    );
    setTempSortBy(sortBy);
  }, [pathCategorySlug, pathSubCategorySlug, activeCategoryObj, activeSubCategoryObj, sortBy]);

  // Categories filtered strictly by currently selected collection
  const filteredCategoriesForCollection = useMemo(() => {
    if (!activeCollectionObj) return [];
    return categories.filter((cat) => {
      const colIdMatch = cat.collection_id && cat.collection_id === activeCollectionObj.id;
      const colSlugMatch = cat.collection_id && activeCollectionObj.slug && cat.collection_id === activeCollectionObj.slug;
      const colNameMatch =
        cat.collection_name &&
        activeCollectionObj.name &&
        makeSlug(cat.collection_name) === makeSlug(activeCollectionObj.name);

      return colIdMatch || colSlugMatch || colNameMatch;
    });
  }, [categories, activeCollectionObj]);

  // Staged Category Object for dynamic Sub-Category dropdown
  const tempCategoryObj = useMemo(() => {
    if (!tempCategorySlug) return null;
    return categories.find(
      (c) =>
        makeSlug(c.slug || c.name) === makeSlug(tempCategorySlug) ||
        c.id === tempCategorySlug ||
        makeSlug(c.name) === makeSlug(tempCategorySlug)
    );
  }, [categories, tempCategorySlug]);

  // Subcategories filtered dynamically based on staged Category selection
  const availableSubCategoriesForTempCategory = useMemo(() => {
    if (!tempCategoryObj) return [];
    return subCategories.filter((sub) => {
      const catIdMatch = sub.category_id && sub.category_id === tempCategoryObj.id;
      const catSlugMatch = sub.category_id && tempCategoryObj.slug && sub.category_id === tempCategoryObj.slug;
      const catNameMatch =
        sub.category_name &&
        tempCategoryObj.name &&
        makeSlug(sub.category_name) === makeSlug(tempCategoryObj.name);

      return catIdMatch || catSlugMatch || catNameMatch;
    });
  }, [subCategories, tempCategoryObj]);

  // Handle Apply Filters Action
  const handleApplyFilters = () => {
    setSortBy(tempSortBy);
    const parentCol = pathCollectionSlug || (activeCollectionObj ? makeSlug(activeCollectionObj.slug || activeCollectionObj.name) : "all");

    if (!tempCategorySlug) {
      if (pathCollectionSlug && pathCollectionSlug !== "all") {
        router.push(`/collection/${pathCollectionSlug}`);
      } else {
        router.push("/collection");
      }
    } else if (!tempSubCategorySlug) {
      router.push(`/collection/${parentCol}/${tempCategorySlug}`);
    } else {
      router.push(`/collection/${parentCol}/${tempCategorySlug}/${tempSubCategorySlug}`);
    }
  };

  // Handle Clear Filters Action
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedGender("all");
    setSortBy("newest");
    setTempSortBy("newest");
    setTempCategorySlug("");
    setTempSubCategorySlug("");

    if (pathCollectionSlug && pathCollectionSlug !== "all") {
      router.push(`/collection/${pathCollectionSlug}`);
    } else {
      router.push("/collection");
    }
  };

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Collection Filter
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

        // 4. Search Term Filter (Name, SKU, Collection, Category, Sub-Category)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const matches =
            p.name?.toLowerCase().includes(term) ||
            (p.sku && p.sku.toLowerCase().includes(term)) ||
            (p.collection_name && p.collection_name.toLowerCase().includes(term)) ||
            (p.category_name && p.category_name.toLowerCase().includes(term)) ||
            (p.sub_category_name && p.sub_category_name.toLowerCase().includes(term)) ||
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
    sortBy,
  ]);

  // Page Header Title Computation
  const pageTitle = useMemo(() => {
    if (activeSubCategoryObj) return `${activeSubCategoryObj.name} Jewelry`;
    if (activeCategoryObj) return `${activeCategoryObj.name} Collection`;
    if (activeCollectionObj) return `${activeCollectionObj.name} Collection`;
    return "All Fine Jewelry Products";
  }, [activeSubCategoryObj, activeCategoryObj, activeCollectionObj]);

  const hasActiveFilters = Boolean(
    pathCategorySlug || pathSubCategorySlug || searchTerm || selectedGender !== "all" || sortBy !== "newest"
  );

  const activeFilterCount = [
    pathCategorySlug,
    pathSubCategorySlug,
    searchTerm,
    sortBy !== "newest" ? sortBy : null,
  ].filter(Boolean).length;

  // Options formatting for CustomSelect
  const categoryOptions = useMemo(() => {
    return [
      { label: "All Categories", value: "" },
      ...filteredCategoriesForCollection.map((cat) => ({
        label: cat.name,
        value: makeSlug(cat.slug || cat.name),
      })),
    ];
  }, [filteredCategoriesForCollection]);

  const subCategoryOptions = useMemo(() => {
    if (!tempCategorySlug) {
      return [{ label: "Select a Category First", value: "" }];
    }
    if (availableSubCategoriesForTempCategory.length === 0) {
      return [{ label: "No Sub-Categories", value: "" }];
    }
    return [
      { label: "All Sub-Categories", value: "" },
      ...availableSubCategoriesForTempCategory.map((sub) => ({
        label: sub.name,
        value: makeSlug(sub.slug || sub.name),
      })),
    ];
  }, [tempCategorySlug, availableSubCategoriesForTempCategory]);

  const priceOptions = [
    { label: "All Prices", value: "all" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-900 font-sans pb-16">
      {/* Top Header & Prominent Search Input Section */}
      <div className="bg-white border-b border-gray-200/80 py-6 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto space-y-4">
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

          {/* Clean Title Header */}
          <div className="pt-1">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Filter Bar & Product Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Horizontal Filter Control Bar (Below Search) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-end">
            
            {/* 1. Category Custom Dropdown */}
            <div>
              <CustomSelect
                label="Category"
                value={tempCategorySlug}
                options={categoryOptions}
                onChange={(val) => {
                  setTempCategorySlug(val);
                  setTempSubCategorySlug("");
                }}
                placeholder="All Categories"
              />
            </div>

            {/* 2. Sub-Category Custom Dropdown */}
            <div>
              <CustomSelect
                label="Sub-Category"
                value={tempSubCategorySlug}
                options={subCategoryOptions}
                onChange={(val) => setTempSubCategorySlug(val)}
                disabled={!tempCategorySlug || availableSubCategoriesForTempCategory.length === 0}
                placeholder={!tempCategorySlug ? "Select Category First" : "All Sub-Categories"}
              />
            </div>

            {/* 3. Price Filter Custom Dropdown */}
            <div>
              <CustomSelect
                label="Price Filter"
                value={tempSortBy === "price-asc" || tempSortBy === "price-desc" ? tempSortBy : "all"}
                options={priceOptions}
                onChange={(val) => setTempSortBy(val === "all" ? "newest" : val)}
                placeholder="All Prices"
              />
            </div>

            {/* 4. Apply Filter Button */}
            <div>
              <button
                onClick={handleApplyFilters}
                className="w-full h-[42px] px-4 py-2.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" /> Apply Filter
              </button>
            </div>

            {/* 5. Clear Filter Button */}
            <div>
              <button
                onClick={handleClearAllFilters}
                className="w-full h-[42px] px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:text-red-600 hover:border-red-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filter
              </button>
            </div>

          </div>
        </div>

        {/* Dedicated Active Filters Container Card */}
        {hasActiveFilters ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 uppercase tracking-wider pr-3 border-r border-gray-200 shrink-0">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Active Filters</span>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-700 font-extrabold">
                  {activeFilterCount}
                </span>
              </div>

              {pathCollectionSlug && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E2E48] text-white text-xs font-bold shadow-2xs">
                  <span className="text-amber-300 font-normal">Collection:</span>
                  <span>{activeCollectionObj?.name || pathCollectionSlug}</span>
                </span>
              )}

              {pathCategorySlug && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E2E48] text-white text-xs font-bold shadow-2xs">
                  <span className="text-amber-300 font-normal">Category:</span>
                  <span>{activeCategoryObj?.name || pathCategorySlug}</span>
                  <button onClick={() => { setTempCategorySlug(""); handleClearAllFilters(); }} className="hover:text-red-300 cursor-pointer ml-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {pathSubCategorySlug && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E2E48] text-white text-xs font-bold shadow-2xs">
                  <span className="text-amber-300 font-normal">Sub-Cat:</span>
                  <span>{activeSubCategoryObj?.name || pathSubCategorySlug}</span>
                  <button onClick={() => { setTempSubCategorySlug(""); handleApplyFilters(); }} className="hover:text-red-300 cursor-pointer ml-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {sortBy === "price-asc" && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E2E48] text-white text-xs font-bold shadow-2xs">
                  <span>Price: Low to High</span>
                  <button onClick={() => { setTempSortBy("newest"); setSortBy("newest"); }} className="hover:text-red-300 cursor-pointer ml-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {sortBy === "price-desc" && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E2E48] text-white text-xs font-bold shadow-2xs">
                  <span>Price: High to Low</span>
                  <button onClick={() => { setTempSortBy("newest"); setSortBy("newest"); }} className="hover:text-red-300 cursor-pointer ml-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1E2E48] text-white text-xs font-bold shadow-2xs">
                  <span className="text-amber-300 font-normal">Search:</span>
                  <span>"{searchTerm}"</span>
                  <button onClick={() => setSearchTerm("")} className="hover:text-red-300 cursor-pointer ml-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 shrink-0 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 italic flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Showing all active catalog products</span>
            </p>
            <p className="text-xs font-semibold text-gray-500">
              Total <span className="font-bold text-gray-900">{filteredProducts.length}</span> Products
            </p>
          </div>
        )}

        {/* Product Cards Catalog Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
            <Loader2 className="w-9 h-9 animate-spin text-black" />
            <p className="text-xs font-semibold text-gray-500">Loading active jewelry products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 py-16 px-6 text-center flex flex-col items-center justify-center space-y-6 shadow-xs">
            {/* Box with Cute Peeking Eyes SVG Illustration */}
            <div className="w-36 h-36 relative flex items-center justify-center">
              <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Top Flaps */}
                <path d="M40 75L100 40L160 75L100 108L40 75Z" fill="#F59E0B" />
                <path d="M40 75L100 40L88 24L28 58L40 75Z" fill="#EAB308" />
                <path d="M160 75L100 40L112 24L172 58L160 75Z" fill="#EAB308" />
                
                {/* Box Front & Side */}
                <path d="M40 75L100 108V170L40 138V75Z" fill="#D97706" />
                <path d="M100 108L160 75V138L100 170V108Z" fill="#B45309" />
                
                {/* Cute Peeking Eyes inside the box gap */}
                <circle cx="91" cy="80" r="5.5" fill="white" />
                <circle cx="92.5" cy="80" r="2.8" fill="#1E293B" />
                <circle cx="109" cy="80" r="5.5" fill="white" />
                <circle cx="107.5" cy="80" r="2.8" fill="#1E293B" />
              </svg>
            </div>

            {/* Headline & Description */}
            <div className="space-y-2 max-w-md">
              <h3 className="text-2xl sm:text-3xl font-serif text-gray-900 font-medium tracking-tight">
                Sorry, No Product Found
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-sans leading-relaxed">
                {searchTerm
                  ? `No products found matching "${searchTerm}".`
                  : activeSubCategoryObj
                  ? `No products currently available in ${activeSubCategoryObj.name}.`
                  : activeCategoryObj
                  ? `No products currently available in ${activeCategoryObj.name}.`
                  : activeCollectionObj
                  ? `No products currently available in ${activeCollectionObj.name} collection.`
                  : "No products currently available matching your selected filter criteria."}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleClearAllFilters}
              className="px-8 py-3 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer rounded-xs"
            >
              BACK TO SHOP
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
