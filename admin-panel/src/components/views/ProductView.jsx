"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import ProductCard from "./ProductCard";

import { useDispatch, useSelector } from "react-redux";
import {
  setCollection,
  setCategory,
  setSubCategory,
  setColors,
  setPurities,
} from "@/store/slice/commonSlice";
import {
  fetchCollectionsAction,
  fetchCategoriesAction,
  fetchSubCategoriesAction,
  fetchColorsAction,
  fetchPuritiesAction,
  fetchProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductActiveAction,
} from "@/action/common.action";

// Available Master Data References (from Supabase schema)
const AVAILABLE_CARATS = ["14K", "16K", "18K", "22K", "24K"];
const AVAILABLE_COLORS = [
  { id: "col-1", name: "Yellow Gold", hex: "#FFD700" },
  { id: "col-2", name: "Rose Gold", hex: "#B76E79" },
  { id: "col-3", name: "White Gold", hex: "#E5E4E2" },
  { id: "col-4", name: "Silver", hex: "#C0C0C0" },
  { id: "col-5", name: "Platinum", hex: "#D5D5D5" },
];

const DEFAULT_COLLECTIONS = [
  "Bridal Collection",
  "Heritage Gold",
  "Modern Romance",
  "Gemstone Luxury",
  "Royal Solitaire",
  "Daily Elegance",
];

const DEFAULT_CATEGORIES = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Bands",
  "Bracelets",
  "Pendants",
];

export default function ProductView({ onBack }) {
  const dispatch = useDispatch();
  const reduxCollections = useSelector((state) => state.common?.collection) || [];
  const reduxCategories = useSelector((state) => state.common?.category) || [];
  const reduxSubCategories = useSelector((state) => state.common?.subCategory) || [];
  const reduxColors = useSelector((state) => state.common?.colors) || [];
  const reduxPurities = useSelector((state) => state.common?.purities) || [];

  // Screen mode: 'list' (product cards grid) or 'create' (full page create screen)
  const [viewMode, setViewMode] = useState("list");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState("all");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Product List State
  const [products, setProducts] = useState([]);

  const loadProducts = React.useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetchProductsAction();
      if (res?.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch collections, categories, sub-categories, colors, purities, and products from database on mount
  React.useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [colRes, catRes, subRes, colorRes, purityRes] = await Promise.all([
          fetchCollectionsAction(),
          fetchCategoriesAction(),
          fetchSubCategoriesAction(),
          fetchColorsAction(),
          fetchPuritiesAction(),
        ]);
        if (colRes?.data) dispatch(setCollection(colRes.data));
        if (catRes?.data) dispatch(setCategory(catRes.data));
        if (subRes?.data) dispatch(setSubCategory(subRes.data));
        if (colorRes?.data) dispatch(setColors(colorRes.data));
        if (purityRes?.data) dispatch(setPurities(purityRes.data));
      } catch (err) {
        console.error("Error loading taxonomies:", err);
      }
    };

    loadTaxonomies();
    loadProducts();
  }, [dispatch, loadProducts]);

  // Comprehensive Product Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    stock: "",
    collection_id: "",
    collection: "",
    category_id: "",
    category: "",
    sub_category_id: "",
    sub_category: "",
    is_active: true,
    gender: null,
    ring_size: "",
    weight: "",
    size: "",
  });

  // Cascading Available Collections
  const collectionOptions = React.useMemo(() => {
    if (reduxCollections.length > 0) {
      return reduxCollections.map((c) =>
        typeof c === "string" ? { id: c, name: c } : { id: c.id, name: c.name }
      );
    }
    return DEFAULT_COLLECTIONS.map((c) => ({ id: c, name: c }));
  }, [reduxCollections]);

  // Cascading Available Categories based on selected Collection
  const availableCategories = React.useMemo(() => {
    // If no collection is selected yet, return empty list
    if (!formData.collection_id && !formData.collection) return [];

    if (reduxCategories.length > 0) {
      const filtered = reduxCategories.filter(
        (cat) =>
          cat.collection_id === formData.collection_id ||
          cat.collections?.id === formData.collection_id ||
          cat.collection_name === formData.collection ||
          cat.collections?.name === formData.collection
      );
      return filtered.length > 0 ? filtered : reduxCategories;
    }

    // Default categories list fallback
    return [
      { id: "Rings", name: "Rings" },
      { id: "Necklaces", name: "Necklaces" },
      { id: "Earrings", name: "Earrings" },
      { id: "Bands", name: "Bands" },
      { id: "Bracelets", name: "Bracelets" },
      { id: "Pendants", name: "Pendants" },
    ];
  }, [reduxCategories, formData.collection_id, formData.collection]);

  // Cascading Available Sub-Categories based on selected Category
  const availableSubCategories = React.useMemo(() => {
    // If no category is selected yet, return empty list
    if (!formData.category_id && !formData.category) return [];

    if (reduxSubCategories.length > 0) {
      const filtered = reduxSubCategories.filter(
        (sub) =>
          sub.category_id === formData.category_id ||
          sub.categories?.id === formData.category_id ||
          sub.category_name === formData.category ||
          sub.categories?.name === formData.category
      );
      return filtered.length > 0 ? filtered : reduxSubCategories;
    }

    // Fallback subcategories mapped per category name
    const catLower = (formData.category || "").toLowerCase();
    if (catLower.includes("ring")) {
      return [
        { id: "Solitaire Rings", name: "Solitaire Rings" },
        { id: "Engagement Rings", name: "Engagement Rings" },
        { id: "Band Rings", name: "Band Rings" },
        { id: "Cocktail Rings", name: "Cocktail Rings" },
        { id: "Stackable Rings", name: "Stackable Rings" },
      ];
    } else if (catLower.includes("necklace")) {
      return [
        { id: "Chokers", name: "Chokers" },
        { id: "Pendant Necklaces", name: "Pendant Necklaces" },
        { id: "Long Chains", name: "Long Chains" },
        { id: "Statement Necklaces", name: "Statement Necklaces" },
      ];
    } else if (catLower.includes("earring")) {
      return [
        { id: "Stud Earrings", name: "Stud Earrings" },
        { id: "Drop & Dangle", name: "Drop & Dangle" },
        { id: "Hoop Earrings", name: "Hoop Earrings" },
        { id: "Ear Cuffs", name: "Ear Cuffs" },
      ];
    } else if (catLower.includes("band")) {
      return [
        { id: "Diamond Bands", name: "Diamond Bands" },
        { id: "Eternity Bands", name: "Eternity Bands" },
        { id: "Gold Bands", name: "Gold Bands" },
      ];
    } else if (catLower.includes("bracelet")) {
      return [
        { id: "Tennis Bracelets", name: "Tennis Bracelets" },
        { id: "Bangles", name: "Bangles" },
        { id: "Charm Bracelets", name: "Charm Bracelets" },
      ];
    } else if (catLower.includes("pendant")) {
      return [
        { id: "Diamond Pendants", name: "Diamond Pendants" },
        { id: "Gemstone Pendants", name: "Gemstone Pendants" },
        { id: "Initial Pendants", name: "Initial Pendants" },
      ];
    }

    return [
      { id: "General", name: "General" },
      { id: "Signature Edition", name: "Signature Edition" },
    ];
  }, [reduxSubCategories, formData.category_id, formData.category]);

  // Color options from Database / Redux or fallback
  const colorOptions = React.useMemo(() => {
    if (reduxColors.length > 0) {
      return reduxColors.map((c) => ({
        id: c.id,
        name: c.name,
        hex: c.hex_code || c.hex || "#E5C158",
      }));
    }
    return AVAILABLE_COLORS;
  }, [reduxColors]);

  // Carat purity options from Database / Redux or fallback
  const caratOptions = React.useMemo(() => {
    if (reduxPurities.length > 0) {
      return reduxPurities.map((p) => (typeof p === "string" ? p : p.carat));
    }
    return AVAILABLE_CARATS;
  }, [reduxPurities]);

  // Handlers for Cascading Select Changes
  const handleCollectionChange = (e) => {
    const val = e.target.value;
    const selectedObj = collectionOptions.find(
      (c) => c.id === val || c.name === val
    );
    const nameStr = selectedObj?.name || val;
    const idStr = selectedObj?.id || val;

    setFormData((prev) => ({
      ...prev,
      collection_id: idStr,
      collection: nameStr,
      category_id: "",
      category: "",
      sub_category_id: "",
      sub_category: "",
    }));
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    const selectedObj = availableCategories.find(
      (c) => c.id === val || c.name === val
    );
    const nameStr = selectedObj?.name || val;
    const idStr = selectedObj?.id || val;

    setFormData((prev) => ({
      ...prev,
      category_id: idStr,
      category: nameStr,
      sub_category_id: "",
      sub_category: "",
    }));
  };

  const handleSubCategoryChange = (e) => {
    const val = e.target.value;
    const selectedObj = availableSubCategories.find(
      (s) => s.id === val || s.name === val
    );
    const nameStr = selectedObj?.name || val;
    const idStr = selectedObj?.id || val;

    setFormData((prev) => ({
      ...prev,
      sub_category_id: idStr,
      sub_category: nameStr,
    }));
  };

  // Selected Variations State (empty by default)
  const [selectedCarats, setSelectedCarats] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // Color Media Mapping State { [colorName]: { thumbnail: null, thumbnailFile: null, images: [], imageFiles: [], video_url: '', videoFile: null } }
  const [colorMedia, setColorMedia] = useState({});

  // Name Input Handler
  const handleNameChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  // Carat Handlers
  const handleAddCarat = (caratVal) => {
    if (!caratVal) return;
    if (!selectedCarats.includes(caratVal)) {
      setSelectedCarats((prev) => [...prev, caratVal]);
    }
  };

  const handleRemoveCarat = (caratVal) => {
    setSelectedCarats((prev) => prev.filter((c) => c !== caratVal));
  };

  // Color Handlers
  const handleAddColor = (colorId) => {
    if (!colorId) return;
    const foundColor = colorOptions.find((c) => c.id === colorId);
    if (foundColor && !selectedColors.some((c) => c.id === colorId)) {
      setSelectedColors((prev) => [...prev, foundColor]);
      setColorMedia((prev) => ({
        ...prev,
        [foundColor.name]: { thumbnail: null, thumbnailFile: null, images: [], imageFiles: [], video_url: "", videoFile: null },
      }));
    }
  };

  const handleRemoveColor = (colorId) => {
    const foundColor = selectedColors.find((c) => c.id === colorId);
    setSelectedColors((prev) => prev.filter((c) => c.id !== colorId));
    if (foundColor) {
      setColorMedia((prev) => {
        const copy = { ...prev };
        delete copy[foundColor.name];
        return copy;
      });
    }
  };

  // Media Handlers
  const handleThumbnailChange = (colorName, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setColorMedia((prev) => ({
      ...prev,
      [colorName]: {
        ...(prev[colorName] || { images: [], video_url: "" }),
        thumbnail: url,
        thumbnailFile: file,
      },
    }));
  };

  const handleRemoveThumbnail = (colorName) => {
    setColorMedia((prev) => ({
      ...prev,
      [colorName]: {
        ...(prev[colorName] || { images: [], video_url: "" }),
        thumbnail: null,
        thumbnailFile: null,
      },
    }));
  };

  const handleDetailImagesChange = (colorName, files) => {
    if (!files || files.length === 0) return;
    const newFilesArray = Array.from(files);
    const urls = newFilesArray.map((f) => URL.createObjectURL(f));
    setColorMedia((prev) => ({
      ...prev,
      [colorName]: {
        ...(prev[colorName] || { thumbnail: null, video_url: "" }),
        images: [...(prev[colorName]?.images || []), ...urls],
        imageFiles: [...(prev[colorName]?.imageFiles || []), ...newFilesArray],
      },
    }));
  };

  // Delete Individual Detail Image
  const handleRemoveDetailImage = (colorName, imageIndex) => {
    setColorMedia((prev) => ({
      ...prev,
      [colorName]: {
        ...prev[colorName],
        images: (prev[colorName]?.images || []).filter(
          (_, idx) => idx !== imageIndex
        ),
        imageFiles: (prev[colorName]?.imageFiles || []).filter(
          (_, idx) => idx !== imageIndex
        ),
      },
    }));
  };

  const handleVideoChange = (colorName, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setColorMedia((prev) => ({
      ...prev,
      [colorName]: {
        ...(prev[colorName] || { thumbnail: null, images: [] }),
        video_url: url,
        video_name: file.name,
        videoFile: file,
      },
    }));
  };

  const handleRemoveVideo = (colorName) => {
    setColorMedia((prev) => ({
      ...prev,
      [colorName]: {
        ...(prev[colorName] || { thumbnail: null, images: [] }),
        video_url: "",
        video_name: "",
        videoFile: null,
      },
    }));
  };

  const [editingProductId, setEditingProductId] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    product: null,
    isDeleting: false,
  });

  // Reset and Open Product Creation Form
  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormData({
      name: "",
      description: "",
      sku: "",
      price: "",
      stock: "",
      collection_id: "",
      collection: "",
      category_id: "",
      category: "",
      sub_category_id: "",
      sub_category: "",
      is_active: true,
      gender: null,
      ring_size: "",
      weight: "",
      size: "",
    });
    setSelectedCarats([]);
    setSelectedColors([]);
    setColorMedia({});
    setViewMode("create");
  };

  // Populate form for Editing Product
  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      sku: product.sku || "",
      price: product.price ? String(product.price) : "",
      stock: product.stock ? String(product.stock) : "",
      collection_id: product.collection_id || "",
      collection: product.collection || "",
      category_id: product.category_id || "",
      category: product.category || "",
      sub_category_id: product.sub_category_id || "",
      sub_category: product.sub_category || "",
      is_active: product.is_active ?? true,
      gender: product.gender || null,
      ring_size: product.ring_size || product.size || "",
      weight: product.weight || "",
      size: product.size || "",
    });

    // Populate selected carats
    let carats = [];
    if (product.carats && Array.isArray(product.carats) && product.carats.length > 0) {
      carats = [...product.carats];
    }

    const vars = product.product_variations || product.rawVariations || [];
    vars.forEach((v) => {
      const cVal = (typeof v.purity === "object" ? v.purity?.carat : v.purity) || v.carat || v.carat_purity;
      if (cVal) carats.push(cVal);

      if (v.sku) {
        const skuMatches = v.sku.match(/\b(10K|14K|16K|18K|20K|22K|24K)\b/gi);
        if (skuMatches) skuMatches.forEach((m) => carats.push(m.toUpperCase()));
      }
    });

    // Fallback check on product SKU, name, or description for carat patterns
    if (carats.length === 0) {
      const textToSearch = `${product.sku || ""} ${product.name || ""} ${product.description || ""}`;
      const matches = textToSearch.match(/\b(10K|14K|16K|18K|20K|22K|24K)\b/gi);
      if (matches) {
        matches.forEach((m) => carats.push(m.toUpperCase()));
      }
    }

    setSelectedCarats([...new Set(carats)]);

    // Populate selected colors & media mapping
    const colorList = [];
    const mediaObj = {};

    const rawMedia = product.media_mapping || product.rawMedia || [];

    if (rawMedia && rawMedia.length > 0) {
      rawMedia.forEach((m) => {
        const foundCol = colorOptions.find(
          (c) => c.id === m.color_id || c.name.toLowerCase() === (m.color_name || "").toLowerCase()
        );
        const colObj = foundCol || {
          id: m.color_id || `col-${m.color_name || 'Gold'}`,
          name: m.color_name || (foundCol ? foundCol.name : "Gold"),
          hex: foundCol ? foundCol.hex : "#FFD700",
        };

        if (colObj.name && !colorList.some((c) => c.name.toLowerCase() === colObj.name.toLowerCase())) {
          colorList.push(colObj);
        }

        mediaObj[colObj.name] = {
          thumbnail: m.thumbnail || null,
          thumbnailFile: null,
          images: m.images || [],
          imageFiles: [],
          video_url: m.video_url || "",
          videoFile: null,
        };
      });
    }

    // Check product.colorMedia (map of colorName -> media object)
    if (product.colorMedia && Object.keys(product.colorMedia).length > 0) {
      Object.entries(product.colorMedia).forEach(([colorName, media]) => {
        const foundCol = colorOptions.find(
          (c) => c.name.toLowerCase() === colorName.toLowerCase()
        );
        const colObj = foundCol || {
          id: `col-${colorName}`,
          name: colorName,
          hex: foundCol ? foundCol.hex : "#FFD700",
        };

        if (!colorList.some((c) => c.name.toLowerCase() === colObj.name.toLowerCase())) {
          colorList.push(colObj);
        }

        if (!mediaObj[colObj.name] || (!mediaObj[colObj.name].thumbnail && media.thumbnail)) {
          mediaObj[colObj.name] = {
            thumbnail: media.thumbnail || null,
            thumbnailFile: null,
            images: media.images || [],
            imageFiles: [],
            video_url: media.video_url || "",
            videoFile: null,
          };
        }
      });
    }

    // Fallback check for product.colors string array e.g. ["Yellow Gold", "Rose Gold"]
    if (colorList.length === 0 && product.colors && Array.isArray(product.colors)) {
      product.colors.forEach((colorName) => {
        const foundCol = colorOptions.find(
          (c) => c.name.toLowerCase() === colorName.toLowerCase()
        );
        const colObj = foundCol || {
          id: `col-${colorName}`,
          name: colorName,
          hex: foundCol ? foundCol.hex : "#FFD700",
        };

        if (!colorList.some((c) => c.name.toLowerCase() === colObj.name.toLowerCase())) {
          colorList.push(colObj);
        }

        if (!mediaObj[colObj.name]) {
          mediaObj[colObj.name] = {
            thumbnail: product.image || null,
            thumbnailFile: null,
            images: [],
            imageFiles: [],
            video_url: "",
            videoFile: null,
          };
        }
      });
    }

    setSelectedColors(colorList);
    setColorMedia(mediaObj);
    setViewMode("create");
  };

  // Delete Modal Handlers
  const handleOpenDeleteModal = (product) => {
    setDeleteModalState({ isOpen: true, product, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.product) return;
    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await deleteProductAction(deleteModalState.product.id);
      if (res.error) {
        alert(`Failed to delete product: ${res.error.message || "Unknown error."}`);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== deleteModalState.product.id));
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert("An error occurred while deleting product.");
    } finally {
      setDeleteModalState({ isOpen: false, product: null, isDeleting: false });
    }
  };

  // Submit Handler
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Product Name and Price are required!");
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

    // Check mandatory thumbnails if colors are selected
    for (const colorObj of selectedColors) {
      const media = colorMedia[colorObj.name];
      if (!media || !media.thumbnail) {
        alert(`Main thumbnail image is mandatory for ${colorObj.name}!`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        productId: editingProductId,
        formData,
        selectedCarats,
        selectedColors,
        colorMedia,
        reduxPurities,
      };

      let res = null;
      if (editingProductId) {
        res = await updateProductAction(payload);
      } else {
        res = await createProductAction(payload);
      }

      if (res.error) {
        alert(`Failed to ${editingProductId ? "update" : "add"} product: ${res.error.message || "Unexpected database error."}`);
        setIsSubmitting(false);
        return;
      }

      alert(`Product ${editingProductId ? "updated" : "added and published"} successfully!`);
      await loadProducts();
      setEditingProductId(null);
      setViewMode("list");

      // Reset Form
      setFormData({
        name: "",
        description: "",
        sku: "",
        price: "",
        stock: "",
        collection_id: "",
        collection: "",
        category_id: "",
        category: "",
        sub_category_id: "",
        sub_category: "",
        is_active: true,
        gender: null,
        ring_size: "",
        weight: "",
        size: "",
      });
      setSelectedCarats([]);
      setSelectedColors([]);
      setColorMedia({});
    } catch (err) {
      console.error("Error submitting product:", err);
      alert("An unexpected error occurred while saving the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductActive = async (id) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    const newStatus = !target.is_active;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: newStatus } : p))
    );

    try {
      const res = await toggleProductActiveAction(id, newStatus);
      if (res?.error) {
        console.warn("Status update notice:", res.error.message);
      }
    } catch (err) {
      console.error("Error toggling product status:", err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === "all" ||
      p.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

    const matchesGender =
      selectedGenderFilter === "all" ||
      (selectedGenderFilter === "none" && !p.gender) ||
      (p.gender && p.gender.toLowerCase() === selectedGenderFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesGender;
  });

  const isRingCategory =
    (formData.category || "").toLowerCase().includes("ring") ||
    (formData.sub_category || "").toLowerCase().includes("ring");

  // ==========================================
  // RENDER SCREEN 2: NEW SCREEN PRODUCT CREATION
  // ==========================================
  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        {/* New Screen Top Header */}
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
                {editingProductId ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {editingProductId
                  ? "Update product metadata, carats, colors & media mappings"
                  : "Enter product details, variation carats/colors & color-specific media"}
              </p>
            </div>
          </div>

          {/* Active Switch on Top Right */}
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Active Product
            </span>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: !prev.is_active,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
              {formData.is_active ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>

        {/* Full Page Product Creation Form */}
        <form onSubmit={handleSubmitProduct} className="space-y-6">
          {/* SECTION 1: PRODUCT INFORMATION */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Product Information
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Provide core product metadata including name, description, SKU, pricing, collection, category, and ring specs.
              </p>
            </div>

            {/* Right Column: Input Fields */}
            <div className="md:col-span-2 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platinum Solitaire Diamond Ring"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed product description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                />
              </div>

              {/* SKU & Price in Flex */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JW-RNG-001"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Price (INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 125000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>
              </div>

              {/* Collection & Category in Flex */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Collection
                  </label>
                  <select
                    value={formData.collection_id || formData.collection}
                    onChange={handleCollectionChange}
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

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category_id || formData.category}
                    onChange={handleCategoryChange}
                    disabled={!formData.collection_id && !formData.collection}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.collection_id && !formData.collection
                        ? "Select Collection first..."
                        : "Choose Category..."}
                    </option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-Category & Stock Quantity in Flex (Below Collection & Category) */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Sub-Category
                  </label>
                  <select
                    value={formData.sub_category_id || formData.sub_category}
                    onChange={handleSubCategoryChange}
                    disabled={!formData.category_id && !formData.category}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.category_id && !formData.category
                        ? "Select Category first..."
                        : "Choose Sub-Category..."}
                    </option>
                    {availableSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                  />
                </div>
              </div>

              {/* Ring Specific Attribute Box */}
              {isRingCategory && (
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Ring Specific Attributes
                  </span>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                        Ring Size
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 7 (17.3 mm)"
                        value={formData.ring_size}
                        onChange={(e) =>
                          setFormData({ ...formData, ring_size: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                        Weight (grams)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 4.5 g"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({ ...formData, weight: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                        Size Variant
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. US 7 / EU 54"
                        value={formData.size}
                        onChange={(e) =>
                          setFormData({ ...formData, size: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-amber-200 text-xs text-gray-900 bg-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: PRODUCT VARIATIONS */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                Product Variations
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Select carat purities and metal colors. Selected items appear as card chips with delete options.
              </p>
            </div>

            {/* Right Column: Dropdowns & Cards */}
            <div className="md:col-span-2 space-y-6">
              {/* Carat Purity Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Select Carats (Purity)
                </label>
                <select
                  onChange={(e) => handleAddCarat(e.target.value)}
                  value=""
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    + Choose Carat Purity...
                  </option>
                  {caratOptions.map((c) => (
                    <option
                      key={c}
                      value={c}
                      disabled={selectedCarats.includes(c)}
                    >
                      {c}
                    </option>
                  ))}
                </select>

                {/* Selected Carat Cards with Delete Icon */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {selectedCarats.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No carats selected yet.</p>
                  ) : (
                    selectedCarats.map((carat) => (
                      <div
                        key={carat}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold text-xs shadow-2xs group"
                      >
                        <span>{carat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCarat(carat)}
                          className="text-purple-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Color Metal Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Select Metal Colors
                </label>
                <select
                  onChange={(e) => handleAddColor(e.target.value)}
                  value=""
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all bg-white cursor-pointer"
                >
                  <option value="" disabled>
                    + Choose Metal Color...
                  </option>
                  {colorOptions.map((col) => (
                    <option
                      key={col.id}
                      value={col.id}
                      disabled={selectedColors.some((c) => c.id === col.id)}
                    >
                      {col.name}
                    </option>
                  ))}
                </select>

                {/* Selected Color Cards with Delete Icon */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {selectedColors.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No colors selected yet.</p>
                  ) : (
                    selectedColors.map((colorObj) => (
                      <div
                        key={colorObj.id}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-bold text-xs shadow-2xs"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs"
                          style={{ backgroundColor: colorObj.hex }}
                        />
                        <span>{colorObj.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(colorObj.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: MEDIA MAPPING */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Title & Description */}
            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Media Mapping
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Map thumbnail, detail images (with delete icons), and video URLs to each selected color. Thumbnail is mandatory.
              </p>
            </div>

            {/* Right Column: Color Accordion Cards */}
            <div className="md:col-span-2 space-y-6">
              {selectedColors.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 italic">
                  Please select at least one color in variations section above to configure media mapping.
                </div>
              ) : (
                selectedColors.map((colorObj) => {
                  const media = colorMedia[colorObj.name] || {
                    thumbnail: null,
                    images: [],
                    video_url: "",
                  };

                  return (
                    <div
                      key={colorObj.id}
                      className="bg-gray-50/50 rounded-2xl border border-gray-200 p-5 space-y-5 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 border-b border-gray-200/80 pb-3">
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs"
                          style={{ backgroundColor: colorObj.hex }}
                        />
                        <h5 className="font-bold text-gray-900 text-sm">
                          {colorObj.name} Media Mappings
                        </h5>
                      </div>

                      {/* Main Thumbnail Image (Mandatory) */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                          Main Thumbnail Image <span className="text-red-500">* (Mandatory)</span>
                        </label>

                        {media.thumbnail ? (
                          <div className="relative w-44 h-32 rounded-xl overflow-hidden border border-gray-200 group">
                            <img
                              src={media.thumbnail}
                              alt={`${colorObj.name} thumbnail`}
                              className="w-full h-full object-cover"
                            />
                            {/* Thumbnail Delete Cross Icon */}
                            <button
                              type="button"
                              onClick={() => handleRemoveThumbnail(colorObj.name)}
                              className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-colors cursor-pointer"
                              title="Delete thumbnail"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-red-200 bg-white rounded-xl p-4 text-center relative flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-red-50/30 transition-colors">
                            <Upload className="w-5 h-5 text-red-400" />
                            <p className="text-xs font-medium text-gray-600">
                              Upload Main Thumbnail for <span className="font-bold">{colorObj.name}</span>
                            </p>
                            <span className="text-[10px] text-red-500 font-semibold">
                              Required image
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleThumbnailChange(
                                  colorObj.name,
                                  e.target.files[0]
                                )
                              }
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>

                      {/* Detail Images Upload & Preview with Cross Delete Buttons */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                          Detail Images
                        </label>

                        {/* File Choose Button Box */}
                        <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl p-3 text-center relative flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">
                            + Add detail images for {colorObj.name}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              handleDetailImagesChange(
                                colorObj.name,
                                e.target.files
                              )
                            }
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* Detail Image Thumbnails with Cross Delete Icons */}
                        {media.images && media.images.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-3">
                            {media.images.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group bg-white shadow-2xs"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Detail ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />

                                {/* Delete Cross Icon on Detail Image */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveDetailImage(colorObj.name, idx)
                                  }
                                  className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-red-600 text-white p-1 rounded-full shadow-md transition-colors cursor-pointer"
                                  title="Delete image"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Video File Upload (Optional) */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-purple-600" />
                          Product Video <span className="text-gray-400 font-normal text-[11px] uppercase tracking-normal">(Optional)</span>
                        </label>

                        {media.video_url ? (
                          <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-900/5 p-3 flex flex-col items-center gap-2 group">
                            <video
                              src={media.video_url}
                              controls
                              className="max-h-48 w-full rounded-lg object-contain bg-black shadow-xs"
                            />
                            <div className="flex items-center justify-between w-full pt-1 px-1">
                              <span
                                className="text-xs font-semibold text-gray-700 truncate max-w-[70%]"
                                title={media.video_name || "Uploaded Video"}
                              >
                                {media.video_name || "Uploaded Video"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(colorObj.name)}
                                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                title="Remove Video"
                              >
                                <X className="w-3.5 h-3.5" /> Remove Video
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-200 bg-white rounded-xl p-4 text-center relative flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-purple-50/20 hover:border-purple-300 transition-all">
                            <Film className="w-5 h-5 text-gray-400" />
                            <p className="text-xs font-medium text-gray-700">
                              + Choose Video File for <span className="font-bold text-gray-900">{colorObj.name}</span>
                            </p>
                            <span className="text-[10px] text-gray-400 font-normal">
                              Supports MP4, WEBM, MOV (Select file from device)
                            </span>
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/*"
                              onChange={(e) =>
                                handleVideoChange(
                                  colorObj.name,
                                  e.target.files[0]
                                )
                              }
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Actions Footer Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setViewMode("list")}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-900 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{editingProductId ? "Updating Product..." : "Saving & Publishing..."}</span>
                </>
              ) : (
                editingProductId ? "Update Product" : "Save & Publish Product"
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ==========================================
  // RENDER SCREEN 1: PRODUCT GRID CATALOG
  // ==========================================
  return (
    <div className="space-y-6 relative">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              PRODUCTS CATALOG
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Manage jewelry products, carats, color variations & media mappings
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {(reduxCategories.length > 0
                ? reduxCategories.map((c) => (typeof c === "string" ? c : c.name))
                : DEFAULT_CATEGORIES
              ).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <select
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              className="text-xs font-semibold text-gray-700 bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid View: 4 Cards Per Row */}
      {isLoadingProducts ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-xs font-semibold text-gray-500">Loading products from database...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Products Found</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            No products match your current search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggleActive={toggleProductActive}
              onEdit={handleEditProduct}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deleteModalState.isOpen && deleteModalState.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  Delete Product?
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 flex items-center gap-3">
              {deleteModalState.product.image ? (
                <img
                  src={deleteModalState.product.image}
                  alt={deleteModalState.product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
              )}
              <div className="truncate">
                <h4 className="font-bold text-sm text-gray-900 truncate">
                  {deleteModalState.product.name}
                </h4>
                <span className="text-[11px] font-mono text-gray-500">
                  SKU: {deleteModalState.product.sku}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete this product? All product variations, media mapping records, and uploaded storage images/videos will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteModalState.isDeleting}
                onClick={() => setDeleteModalState({ isOpen: false, product: null, isDeleting: false })}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteModalState.isDeleting}
                onClick={handleConfirmDelete}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deleteModalState.isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
