"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Package,
  X,
  Upload,
  Filter,
  User,
  Power,
  Trash2,
  Image as ImageIcon,
  Film,
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  Loader2,
  Edit3,
  AlertTriangle,
  Palette,
  Gem,
  Tag,
  DollarSign,
  Scale,
  Building2,
  CheckSquare,
  Square,
} from "lucide-react";
import ProductCard from "./ProductCard";

import { useDispatch, useSelector } from "react-redux";
import {
  setCollection,
  setCategory,
  setSubCategory,
  setColors,
  setKarats,
  setDiamondShapes,
} from "@/store/slice/commonSlice";
import {
  selectProducts,
  selectProductLoading,
  selectIsSubmitting,
} from "@/store/slice/productSlice";
import {
  fetchProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductActiveAction,
} from "@/action/product.action";
import {
  fetchCollectionsAction,
  fetchCategoriesAction,
  fetchSubCategoriesAction,
  fetchColorsAction,
  fetchKaratsAction,
  fetchDiamondShapesAction,
} from "@/action/common.action";

export default function ProductView({ onBack }) {
  const dispatch = useDispatch();

  // Redux Selectors — Reading directly from Redux Store
  const reduxCollections = useSelector((state) => state.common?.collection) || [];
  const reduxCategories = useSelector((state) => state.common?.category) || [];
  const reduxSubCategories = useSelector((state) => state.common?.subCategory) || [];
  const reduxColors = useSelector((state) => state.common?.colors) || [];
  const reduxKarats = useSelector((state) => state.common?.karats) || [];
  const reduxDiamondShapes = useSelector((state) => state.common?.diamondShapes) || [];

  const products = useSelector(selectProducts);
  const isLoadingProducts = useSelector(selectProductLoading);
  const isSubmitting = useSelector(selectIsSubmitting);

  // Screen Mode: 'list' or 'create'
  const [viewMode, setViewMode] = useState("list");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState("all");

  // Load all master taxonomy references and products into Redux store on mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [colRes, catRes, subRes, colorRes, karatRes, shapeRes] = await Promise.all([
          fetchCollectionsAction(),
          fetchCategoriesAction(),
          fetchSubCategoriesAction(),
          fetchColorsAction(),
          fetchKaratsAction(),
          fetchDiamondShapesAction(),
        ]);
        if (colRes?.data) dispatch(setCollection(colRes.data));
        if (catRes?.data) dispatch(setCategory(catRes.data));
        if (subRes?.data) dispatch(setSubCategory(subRes.data));
        if (colorRes?.data) dispatch(setColors(colorRes.data));
        if (karatRes?.data) dispatch(setKarats(karatRes.data));
        if (shapeRes?.data) dispatch(setDiamondShapes(shapeRes.data));
      } catch (err) {
        console.error("Error loading master reference data:", err);
      }
    };

    loadMasterData();
    dispatch(fetchProductsAction());
  }, [dispatch]);

  // Main Form State matching Supabase Products Schema
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    slug: "",
    description: "",
    collection_id: "",
    category_id: "",
    sub_category_id: "",
    gender: "",
    base_price: "",
    price: "",
    discount_percentage: "",
    stock: "",
    net_weight: "",
    gross_weight: "",
    diamond_weight: "",
    diamond_shape_id: "",
    is_active: true,
  });

  // Selected Colors & Karats for Variations
  const [selectedColorIds, setSelectedColorIds] = useState([]);
  const [selectedKaratIds, setSelectedKaratIds] = useState([]);

  // Variation Media State: { [varKey]: { thumbnail: '', thumbnailFile: null, images: [], imageFiles: [], video: '', videoFile: null } }
  const [variationMedia, setVariationMedia] = useState({});

  const [editingProductId, setEditingProductId] = useState(null);

  // Cascading Collections Options
  const collectionOptions = useMemo(() => {
    return (reduxCollections || []).map((c) =>
      typeof c === "string" ? { id: c, name: c } : { id: c.id, name: c.name }
    );
  }, [reduxCollections]);

  // Cascading Categories based on selected Collection
  const availableCategories = useMemo(() => {
    if (!formData.collection_id) return reduxCategories || [];
    return (reduxCategories || []).filter(
      (cat) => cat.collection_id === formData.collection_id || cat.collections?.id === formData.collection_id
    );
  }, [reduxCategories, formData.collection_id]);

  // Cascading Sub-Categories based on selected Category
  const availableSubCategories = useMemo(() => {
    if (!formData.category_id) return reduxSubCategories || [];
    return (reduxSubCategories || []).filter(
      (sub) => sub.category_id === formData.category_id || sub.categories?.id === formData.category_id
    );
  }, [reduxSubCategories, formData.category_id]);

  // Dynamic Variation Matrix: Combination of Selected Gold Colors + Gold Karats
  const generatedVariations = useMemo(() => {
    const variations = [];
    const colorsList = reduxColors.filter((c) => selectedColorIds.includes(c.id));
    const karatsList = reduxKarats.filter((k) => selectedKaratIds.includes(k.id));

    if (colorsList.length > 0 && karatsList.length > 0) {
      colorsList.forEach((col) => {
        karatsList.forEach((kar) => {
          const karatName = typeof kar === "string" ? kar : kar.name || kar.carat || "";
          const key = `${col.id}_${kar.id}`;
          variations.push({
            key,
            color_id: col.id,
            karat_id: kar.id,
            gold_color: col.name,
            gold_karat: karatName,
            hex_code: col.hex_code || "#D4AF37",
          });
        });
      });
    } else if (colorsList.length > 0) {
      colorsList.forEach((col) => {
        const key = `${col.id}_default`;
        variations.push({
          key,
          color_id: col.id,
          karat_id: null,
          gold_color: col.name,
          gold_karat: "",
          hex_code: col.hex_code || "#D4AF37",
        });
      });
    }

    return variations;
  }, [reduxColors, reduxKarats, selectedColorIds, selectedKaratIds]);

  // Open Create Form Reset
  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormData({
      sku: "",
      name: "",
      slug: "",
      description: "",
      collection_id: "",
      category_id: "",
      sub_category_id: "",
      gender: "",
      base_price: "",
      price: "",
      discount_percentage: "",
      stock: "",
      net_weight: "",
      gross_weight: "",
      diamond_weight: "",
      diamond_shape_id: "",
      is_active: true,
    });
    setSelectedColorIds([]);
    setSelectedKaratIds([]);
    setVariationMedia({});
    setViewMode("create");
  };

  // Open Edit Form
  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setFormData({
      sku: product.sku || "",
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      collection_id: product.collection_id || "",
      category_id: product.category_id || "",
      sub_category_id: product.sub_category_id || "",
      gender: product.gender || "",
      base_price: product.base_price ? String(product.base_price) : product.price ? String(product.price) : "",
      price: product.base_price ? String(product.base_price) : product.price ? String(product.price) : "",
      discount_percentage: product.discount_percentage ? String(product.discount_percentage) : "",
      stock: product.stock ? String(product.stock) : "",
      net_weight: product.net_weight ? String(product.net_weight) : "",
      gross_weight: product.gross_weight ? String(product.gross_weight) : "",
      diamond_weight: product.diamond_weight ? String(product.diamond_weight) : "",
      diamond_shape_id: product.diamond_shape_id || "",
      is_active: product.is_active ?? true,
    });

    const comboList = product.variation_combo || [];
    const colorIdsSet = new Set();
    const karatIdsSet = new Set();
    const mediaObj = {};

    comboList.forEach((c) => {
      if (c.color_id) colorIdsSet.add(c.color_id);
      if (c.karat_id) karatIdsSet.add(c.karat_id);

      const key = c.karat_id ? `${c.color_id}_${c.karat_id}` : `${c.color_id}_default`;
      if (c.media_mapping) {
        mediaObj[key] = {
          thumbnail: c.media_mapping.thumbnail || "",
          thumbnailFile: null,
          images: c.media_mapping.images || [],
          imageFiles: [],
          video: c.media_mapping.video || "",
          videoFile: null,
        };
      }
    });

    if (colorIdsSet.size === 0 && Array.isArray(product.colors)) {
      product.colors.forEach((cName) => {
        const found = reduxColors.find((c) => c.name.toLowerCase() === cName.toLowerCase());
        if (found) colorIdsSet.add(found.id);
      });
    }

    if (karatIdsSet.size === 0 && Array.isArray(product.carats)) {
      product.carats.forEach((kName) => {
        const found = reduxKarats.find((k) => (k.name || k.carat || "").toLowerCase() === kName.toLowerCase());
        if (found) karatIdsSet.add(found.id);
      });
    }

    setSelectedColorIds(Array.from(colorIdsSet));
    setSelectedKaratIds(Array.from(karatIdsSet));
    setVariationMedia(mediaObj);
    setViewMode("create");
  };

  // Toggle Color
  const handleToggleColor = (colorId) => {
    setSelectedColorIds((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    );
  };

  // Toggle Karat
  const handleToggleKarat = (karatId) => {
    setSelectedKaratIds((prev) =>
      prev.includes(karatId) ? prev.filter((id) => id !== karatId) : [...prev, karatId]
    );
  };

  // Media Handlers per variation key
  const handleThumbnailChange = (varKey, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setVariationMedia((prev) => ({
      ...prev,
      [varKey]: {
        ...(prev[varKey] || { images: [], video: "" }),
        thumbnail: previewUrl,
        thumbnailFile: file,
      },
    }));
  };

  const handleDetailImagesChange = (varKey, files) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    const previewUrls = newFiles.map((f) => URL.createObjectURL(f));

    setVariationMedia((prev) => {
      const currentImgs = prev[varKey]?.images || [];
      const currentFiles = prev[varKey]?.imageFiles || [];

      if (currentImgs.length + previewUrls.length > 5) {
        alert("Maximum 5 detail images allowed per product variation.");
      }

      return {
        ...prev,
        [varKey]: {
          ...(prev[varKey] || { thumbnail: "", video: "" }),
          images: [...currentImgs, ...previewUrls].slice(0, 5),
          imageFiles: [...currentFiles, ...newFiles].slice(0, 5),
        },
      };
    });
  };

  const handleRemoveDetailImage = (varKey, imgIdx) => {
    setVariationMedia((prev) => ({
      ...prev,
      [varKey]: {
        ...prev[varKey],
        images: (prev[varKey]?.images || []).filter((_, idx) => idx !== imgIdx),
        imageFiles: (prev[varKey]?.imageFiles || []).filter((_, idx) => idx !== imgIdx),
      },
    }));
  };

  const handleVideoChange = (varKey, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setVariationMedia((prev) => ({
      ...prev,
      [varKey]: {
        ...(prev[varKey] || { thumbnail: "", images: [] }),
        video: previewUrl,
        videoFile: file,
      },
    }));
  };

  // Submit Form Handler — Invokes Redux Actions & Syncs with Supabase
  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      alert("Please enter a Product Name!");
      return;
    }

    if (!formData.base_price && !formData.price) {
      alert("Please enter a Base Price!");
      return;
    }

    if (!formData.collection_id) {
      alert("Please select a Collection for the product!");
      return;
    }

    if (!formData.category_id) {
      alert("Please select a Category for the product!");
      return;
    }

    // Build variations data structure
    const variationsData = generatedVariations.map((v) => {
      const media = variationMedia[v.key] || {};
      return {
        color_id: v.color_id,
        karat_id: v.karat_id,
        gold_color: v.gold_color,
        gold_karat: v.gold_karat,
        thumbnailFile: media.thumbnailFile || null,
        imageFiles: media.imageFiles || [],
        videoFile: media.videoFile || null,
        media: {
          thumbnail: media.thumbnail || "",
          images: media.images || [],
          video: media.video || "",
        },
      };
    });

    try {
      let res = null;
      if (editingProductId) {
        res = await dispatch(
          updateProductAction({
            productId: editingProductId,
            formData,
            variationsData,
          })
        );
      } else {
        res = await dispatch(
          createProductAction({
            formData,
            variationsData,
          })
        );
      }

      if (res?.error) {
        alert(`Failed to ${editingProductId ? "update" : "create"} product: ${res.error.message || "Unknown database error"}`);
        return;
      }

      alert(`Product ${editingProductId ? "updated" : "published"} successfully!`);
      setEditingProductId(null);
      setViewMode("list");
      dispatch(fetchProductsAction());
    } catch (err) {
      console.error("Submit Product Error:", err);
      alert("An error occurred while saving the product.");
    }
  };

  // Filtered Products for List View
  const filteredProducts = (products || []).filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      p.category?.toLowerCase() === selectedCategoryFilter.toLowerCase();

    const matchesGender =
      selectedGenderFilter === "all" ||
      (selectedGenderFilter === "none" && !p.gender) ||
      p.gender?.toLowerCase() === selectedGenderFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesGender;
  });

  // Calculate Metrics KPI Counters
  const activeCount = useMemo(() => (products || []).filter((p) => p.is_active).length, [products]);
  const draftCount = useMemo(() => (products || []).filter((p) => !p.is_active).length, [products]);

  // ==========================================
  // RENDER SCREEN 2: CREATE / EDIT PRODUCT FORM
  // ==========================================
  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        {/* Top Sticky Header */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 hover:text-black transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-black" />
                {editingProductId ? "Edit Jewellery Product" : "Add New Jewellery Product"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Set core product metadata, gold colors, karats, weights, diamond shapes, and variation media.
              </p>
            </div>
          </div>

          {/* Active Product Switch */}
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Product Visibility
            </span>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: !prev.is_active,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                formData.is_active ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formData.is_active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-xs font-semibold text-gray-900 min-w-[50px]">
              {formData.is_active ? "Active" : "Draft"}
            </span>
          </div>
        </div>

        {/* Product Creation Form */}
        <form onSubmit={handleSubmitProduct} className="space-y-6">
          {/* STEP 1: PRODUCT INFORMATION */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Step 1 — Core Information
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Provide core product metadata including SKU, title, pricing, collection, category, and weights.
              </p>
            </div>

            <div className="md:col-span-2 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Solitaire Diamond Ring"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe craftsmanship, gemstone purity, and design highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              {/* SKU & Price & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JW-RNG-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Base Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 125000"
                    value={formData.base_price || formData.price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 10"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>
              </div>

              {/* Taxonomies: Collection, Category, Sub-Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Collection <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.collection_id}
                    onChange={(e) => setFormData({ ...formData, collection_id: e.target.value, category_id: "", sub_category_id: "" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer"
                  >
                    <option value="">Choose Collection...</option>
                    {collectionOptions.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value, sub_category_id: "" })}
                    disabled={!formData.collection_id}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Select Category...</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Sub-Category
                  </label>
                  <select
                    value={formData.sub_category_id}
                    onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value })}
                    disabled={!formData.category_id}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Select Sub-Category...</option>
                    {availableSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender, Stock & Diamond Shape */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer"
                  >
                    <option value="">Select Gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Diamond Shape
                  </label>
                  <select
                    value={formData.diamond_shape_id}
                    onChange={(e) => setFormData({ ...formData, diamond_shape_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer"
                  >
                    <option value="">Select Diamond Shape...</option>
                    {reduxDiamondShapes.map((shape) => (
                      <option key={shape.id} value={shape.id}>
                        {shape.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weights: Net Weight, Gross Weight, Diamond Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Net Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="e.g. 3.500"
                    value={formData.net_weight}
                    onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 text-xs text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Gross Weight (g)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="e.g. 4.200"
                    value={formData.gross_weight}
                    onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 text-xs text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Diamond Weight (cts)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="e.g. 0.750"
                    value={formData.diamond_weight}
                    onChange={(e) => setFormData({ ...formData, diamond_weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 text-xs text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 & 3: SELECT GOLD COLORS & KARATS */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                Step 2 & 3 — Gold Colors & Karats
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Select applicable metal colors and purity karats stored in Redux to construct variation combinations.
              </p>
            </div>

            <div className="md:col-span-2 space-y-6">
              {/* Select Gold Colors */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Gold Colors ({selectedColorIds.length} Selected)
                </label>
                <div className="flex flex-wrap gap-3">
                  {reduxColors.map((col) => {
                    const isSelected = selectedColorIds.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleToggleColor(col.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-black bg-black text-white shadow-xs"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: col.hex_code || "#D4AF37" }}
                        />
                        {col.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Gold Karats */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Gold Karats ({selectedKaratIds.length} Selected)
                </label>
                <div className="flex flex-wrap gap-3">
                  {reduxKarats.map((kar) => {
                    const karatName = typeof kar === "string" ? kar : kar.name || kar.carat || "";
                    const isSelected = selectedKaratIds.includes(kar.id);
                    return (
                      <button
                        key={kar.id}
                        type="button"
                        onClick={() => handleToggleKarat(kar.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-600 bg-amber-500 text-white shadow-xs"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {karatName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4 & 5: VARIATION MATRIX & MEDIA MAPPING */}
          {generatedVariations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Step 4 & 5 — Variation Matrix & Media Upload
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Upload thumbnail (1), detail images (up to 5 max), and video for each generated combination.
                </p>
              </div>

              <div className="space-y-6">
                {generatedVariations.map((v) => {
                  const media = variationMedia[v.key] || {};
                  return (
                    <div
                      key={v.key}
                      className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/20"
                            style={{ backgroundColor: v.hex_code }}
                          />
                          <span className="font-bold text-sm text-gray-900">
                            {v.gold_karat ? `${v.gold_karat} ${v.gold_color}` : v.gold_color}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-500">
                          Storage path: luxora/products/.../variations/
                        </span>
                      </div>

                      {/* Media Upload Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Thumbnail Upload */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Thumbnail (1 Image)
                          </label>
                          {media.thumbnail ? (
                            <div className="relative w-28 h-28 rounded-xl border border-gray-300 overflow-hidden group">
                              <img
                                src={media.thumbnail}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setVariationMedia((prev) => ({
                                    ...prev,
                                    [v.key]: { ...prev[v.key], thumbnail: "", thumbnailFile: null },
                                  }))
                                }
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black cursor-pointer transition-all">
                              <Upload className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-bold uppercase">Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleThumbnailChange(v.key, e.target.files[0])}
                              />
                            </label>
                          )}
                        </div>

                        {/* Detail Images Upload (Max 5) */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Detail Images ({media.images?.length || 0}/5 Max)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(media.images || []).map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative w-16 h-16 rounded-lg border border-gray-300 overflow-hidden">
                                <img src={imgUrl} alt="Detail" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDetailImage(v.key, imgIdx)}
                                  className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {(media.images?.length || 0) < 5 && (
                              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black cursor-pointer transition-all">
                                <Plus className="w-4 h-4" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleDetailImagesChange(v.key, e.target.files)}
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Video Upload */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                            Product Video (Optional)
                          </label>
                          {media.video ? (
                            <div className="relative w-28 h-28 rounded-xl border border-gray-300 overflow-hidden bg-black flex items-center justify-center">
                              <Film className="w-8 h-8 text-white/70" />
                              <button
                                type="button"
                                onClick={() =>
                                  setVariationMedia((prev) => ({
                                    ...prev,
                                    [v.key]: { ...prev[v.key], video: "", videoFile: null },
                                  }))
                                }
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black cursor-pointer transition-all">
                              <Film className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-bold uppercase">Upload Video</span>
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => handleVideoChange(v.key, e.target.files[0])}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-black text-white text-sm font-bold shadow-xs hover:bg-gray-800 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Product...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {editingProductId ? "Save & Update Product" : "Publish Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // RENDER SCREEN 1: PRODUCT LIST & KPI METRICS
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200/80">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-black" />
            Jewellery Product Management
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Manage your jewellery products, variation matrix (Gold Colors + Karats), weights, and variation media mappings stored in Redux & Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold shadow-xs hover:bg-gray-800 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* KPI Metrics Dashboard Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Products</p>
            <h3 className="text-lg font-extrabold text-gray-900">{products.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Published</p>
            <h3 className="text-lg font-extrabold text-gray-900">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gold Colors</p>
            <h3 className="text-lg font-extrabold text-gray-900">{reduxColors.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Gold Karats</p>
            <h3 className="text-lg font-extrabold text-gray-900">{reduxKarats.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, title, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white cursor-pointer"
          >
            <option value="all">All Categories</option>
            {reduxCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedGenderFilter}
            onChange={(e) => setSelectedGenderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white cursor-pointer"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200/80">
          <Loader2 className="w-8 h-8 animate-spin text-black mb-2" />
          <p className="text-xs text-gray-500 font-semibold">Loading products catalog from Redux...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200/80 text-center p-6">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-900">No products found</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
            No jewellery products match your current search or filter options.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold shadow-xs hover:bg-gray-800"
          >
            Add New Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onEdit={() => handleEditProduct(prod)}
              onDelete={() => {
                if (confirm(`Are you sure you want to delete product "${prod.name}"?`)) {
                  dispatch(deleteProductAction(prod.id));
                }
              }}
              onToggleActive={() =>
                dispatch(
                  toggleProductActiveAction({
                    id: prod.id,
                    is_active: !prod.is_active,
                  })
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
