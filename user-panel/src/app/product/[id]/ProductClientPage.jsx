"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowLeft, Loader2, Check, Plus, Minus, Package, Play, ChevronLeft } from "lucide-react";
import CustomImg from "@/components/CustomImg";
import { useCart } from "@/context/CartContext";
import { useDispatch, useSelector } from "react-redux";
import { sortGoldColors } from "@/lib/productService";
import {
  fetchProductDetails,
  setSelectedColor,
  setSelectedPurity,
  setSelectedRingSize,
  setSelectedDiamondShape,
  incrementQuantity,
  decrementQuantity,
  selectCurrentProduct,
  selectMediaList,
  selectProductColors,
  selectProductPurities,
  selectRingSizesList,
  selectDiamondShapeData,
  selectDiamondShapesList,
  selectVariationComboList,
  selectSelectedColor,
  selectSelectedPurity,
  selectSelectedRingSize,
  selectSelectedDiamondShape,
  selectProductQuantity,
  selectProductLoading,
} from "@/store/slice/productSlice";

// Trust Feature Icons
import returnIcon from "@/assets/icons/30days-return.svg";
import packingIcon from "@/assets/icons/elegant-packing.svg";
import resizingIcon from "@/assets/icons/free-resizing.svg";
import pricingIcon from "@/assets/icons/competative-pricing.svg";
import shippingIcon from "@/assets/icons/free-shipping.svg";
import warrantyIcon from "@/assets/icons/lifetime-warranty.svg";

const trustFeatures = [
  { id: 1, title: "15 Days Free Return", icon: returnIcon },
  { id: 2, title: "Elegant Packaging", icon: packingIcon },
  { id: 3, title: "Free Resizing", icon: resizingIcon },
  { id: 4, title: "Competitive Pricing", icon: pricingIcon },
  { id: 5, title: "Free Shipping", icon: shippingIcon },
  { id: 6, title: "Lifetime Warranty", icon: warrantyIcon },
];

export default function ProductClientPage({ params }) {
  const dispatch = useDispatch();

  // Selectors from Redux Product Slice
  const product = useSelector(selectCurrentProduct);
  const mediaList = useSelector(selectMediaList);
  const productColors = useSelector(selectProductColors);
  const productPurities = useSelector(selectProductPurities);
  const ringSizesList = useSelector(selectRingSizesList);
  const diamondShapeData = useSelector(selectDiamondShapeData);
  const diamondShapesList = useSelector(selectDiamondShapesList);
  const variationComboList = useSelector(selectVariationComboList);
  const selectedColor = useSelector(selectSelectedColor);
  const selectedPurity = useSelector(selectSelectedPurity);
  const selectedRingSize = useSelector(selectSelectedRingSize);
  const selectedDiamondShape = useSelector(selectSelectedDiamondShape);
  const quantity = useSelector(selectProductQuantity);
  const loading = useSelector(selectProductLoading);

  const [productId, setProductId] = useState(null);
  const [addedToBag, setAddedToBag] = useState(false);
  const { addToCart } = useCart();

  // Compute matched combination based on selectedColor and selectedPurity
  const matchedCombo = (variationComboList || []).find((c) => {
    const cColor = (c.gold_color || c.color || "").toLowerCase();
    const cKarat = (c.gold_karat || c.karat || "").toLowerCase();
    const selColor = (selectedColor?.name || "").toLowerCase();
    const selKarat = (selectedPurity?.carat || selectedPurity?.name || "").toLowerCase();

    const colorMatch = !selColor || !cColor || cColor === selColor || c.color_id === selectedColor?.id;
    const karatMatch = !selKarat || !cKarat || cKarat === selKarat || c.karat_id === selectedPurity?.id;
    return colorMatch && karatMatch;
  });

  const displayPrice = matchedCombo?.price ?? product?.price ?? product?.base_price ?? 0;
  const displaySku = matchedCombo?.sku || product?.sku || "";

  // Accordion Toggle States
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      if (resolved?.id) {
        setProductId(resolved.id);
      }
    });
  }, [params]);

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId));
    }
  }, [productId, dispatch]);

  const handleAddToBag = () => {
    if (!product) return;
    const mainImg = displayImages[0] || "";
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: mainImg,
      color: selectedColor?.name || "",
      purity: selectedPurity?.carat || selectedPurity?.name || "",
      ringSize: selectedRingSize || "",
      sku: displaySku,
      diamondType: product.diamond_type || "",
      diamondShape: selectedDiamondShape?.name || diamondShapeData?.name || product?.diamond_shape || "",
      diamondQuality: product.diamond_quality || "",
      stock: matchedCombo?.stock !== undefined ? matchedCombo.stock : (product.stock !== undefined ? product.stock : 999),
      quantity: quantity,
    });
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2500);
  };

  // Fallback options for display (computed before hooks)
  const puritiesToDisplay =
    productPurities && productPurities.length > 0
      ? productPurities
      : Array.isArray(product?.variation_combo)
      ? Array.from(
          new Set(
            product.variation_combo
              .map((c) => c.gold_karat || c.karat)
              .filter(Boolean)
          )
        ).map((k) => ({ id: k, name: k, carat: k }))
      : Array.isArray(product?.carats)
      ? product.carats.map((k) => ({ id: k, name: k, carat: k }))
      : Array.isArray(product?.karats)
      ? product.karats.map((k) => ({ id: k, name: k, carat: k }))
      : [];

  const colorsToDisplay = sortGoldColors(
    productColors && productColors.length > 0
      ? productColors
      : Array.isArray(product?.variation_combo)
      ? Array.from(
          new Map(
            product.variation_combo
              .map((c) => [
                c.color_id || c.gold_color,
                {
                  id: c.color_id || c.gold_color,
                  name: c.gold_color || c.color,
                  hex_code: c.hex || "#D4AF37",
                },
              ])
              .filter(([k, v]) => v.name)
          ).values()
        )
      : []
  );

  const diamondShapesToDisplay =
    diamondShapesList && diamondShapesList.length > 0
      ? diamondShapesList
      : diamondShapeData
      ? [diamondShapeData]
      : product?.diamond_shape
      ? [{ id: product.diamond_shape_id || "1", name: product.diamond_shape }]
      : [];

  // Auto-select first item defaults for variant options (all hooks MUST run before early returns)
  useEffect(() => {
    if (!selectedPurity && puritiesToDisplay.length > 0) {
      dispatch(setSelectedPurity(puritiesToDisplay[0]));
    }
  }, [selectedPurity, puritiesToDisplay, dispatch]);

  useEffect(() => {
    if (!selectedColor && colorsToDisplay.length > 0) {
      dispatch(setSelectedColor(colorsToDisplay[0]));
    }
  }, [selectedColor, colorsToDisplay, dispatch]);

  useEffect(() => {
    if (!selectedDiamondShape && diamondShapesToDisplay.length > 0) {
      dispatch(setSelectedDiamondShape(diamondShapesToDisplay[0]));
    }
  }, [selectedDiamondShape, diamondShapesToDisplay, dispatch]);

  useEffect(() => {
    if (!selectedRingSize && ringSizesList.length > 0) {
      const firstVal = ringSizesList[0].name || ringSizesList[0].size_in_mm || ringSizesList[0];
      dispatch(setSelectedRingSize(firstVal));
    }
  }, [selectedRingSize, ringSizesList, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3 p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-800" />
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
          Loading product details...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 p-12 text-center">
        <h2 className="text-2xl font-canela font-normal text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/collection/jewellery"
          className="px-6 py-3 bg-[#202A4E] text-white text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2 hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  // Collect all images and video for display
  let displayImages = [];
  let videoUrl = null;

  // 1. Check matchedCombo for selected variation (Color + Karat)
  if (matchedCombo) {
    const m = matchedCombo.media_mapping || matchedCombo;
    if (m?.thumbnail) displayImages.push(m.thumbnail);
    if (Array.isArray(m?.images)) {
      m.images.forEach((img) => {
        if (img && !displayImages.includes(img)) displayImages.push(img);
      });
    }
    if (m?.video) videoUrl = m.video;
  }

  // 2. Check selectedColor media mapping if matchedCombo had no images
  if (displayImages.length === 0 && selectedColor) {
    const matchingMedia = mediaList.find(
      (m) => m.color_id === selectedColor.id || m.color === selectedColor.name
    );
    if (matchingMedia) {
      if (matchingMedia.thumbnail) displayImages.push(matchingMedia.thumbnail);
      if (Array.isArray(matchingMedia.images)) {
        matchingMedia.images.forEach((img) => {
          if (img && !displayImages.includes(img)) displayImages.push(img);
        });
      }
      if (matchingMedia.video) videoUrl = matchingMedia.video;
    }
  }

  // 3. Check variation_combo list for selected color
  if (displayImages.length === 0 && selectedColor && Array.isArray(variationComboList)) {
    const comboForColor = variationComboList.find(
      (c) =>
        c.color_id === selectedColor.id ||
        c.gold_color?.toLowerCase() === selectedColor.name?.toLowerCase() ||
        c.color?.toLowerCase() === selectedColor.name?.toLowerCase()
    );
    if (comboForColor) {
      const m = comboForColor.media_mapping || comboForColor;
      if (m?.thumbnail) displayImages.push(m.thumbnail);
      if (Array.isArray(m?.images)) {
        m.images.forEach((img) => {
          if (img && !displayImages.includes(img)) displayImages.push(img);
        });
      }
      if (m?.video && !videoUrl) videoUrl = m.video;
    }
  }

  // 4. Collect ALL media from mediaList across colors if still empty
  if (displayImages.length === 0) {
    mediaList.forEach((m) => {
      if (m.thumbnail && !displayImages.includes(m.thumbnail)) displayImages.push(m.thumbnail);
      if (Array.isArray(m.images)) {
        m.images.forEach((img) => {
          if (img && !displayImages.includes(img)) displayImages.push(img);
        });
      }
      if (m.video && !videoUrl) videoUrl = m.video;
    });
  }

  // 5. Collect ALL media from variationComboList if still empty
  if (displayImages.length === 0) {
    (variationComboList || []).forEach((c) => {
      const m = c.media_mapping || c;
      if (m?.thumbnail && !displayImages.includes(m.thumbnail)) displayImages.push(m.thumbnail);
      if (Array.isArray(m?.images)) {
        m.images.forEach((img) => {
          if (img && !displayImages.includes(img)) displayImages.push(img);
        });
      }
      if (m?.video && !videoUrl) videoUrl = m.video;
    });
  }

  // 6. Fallback to product level image / thumbnail / video
  if (displayImages.length === 0 && (product.image || product.thumbnail)) {
    displayImages.push(product.image || product.thumbnail);
  }
  if (!videoUrl && product.video) {
    videoUrl = product.video;
  }

  // Combined media items array for slider
  const allMediaItems = [
    ...displayImages.map((img, i) => ({ type: "image", url: img, id: `img-${i}` })),
    ...(videoUrl ? [{ type: "video", url: videoUrl, id: "video-0" }] : []),
  ];

  // Detail Rows
  const itemDetailRows = [
    displaySku ? { label: "SKU:", value: displaySku } : null,
    selectedPurity?.carat || selectedPurity?.name ? { label: "Metal Type / Karat:", value: selectedPurity.carat || selectedPurity.name } : null,
    selectedColor?.name ? { label: "Metal Color:", value: selectedColor.name } : null,
    selectedRingSize || product.size ? { label: "Ring Size:", value: selectedRingSize || product.size } : null,
    product.net_weight || product.weight || product.approx_weight
      ? {
          label: "Net Weight:",
          value: `${product.net_weight || product.weight || product.approx_weight} gm`,
        }
      : null,
    product.gross_weight ? { label: "Gross Weight:", value: `${product.gross_weight} gm` } : null,
  ].filter(Boolean);

  const diamondInfoRows = [
    product.diamond_type ? { label: "Diamond Type:", value: product.diamond_type } : null,
    selectedDiamondShape?.name || diamondShapeData?.name || product?.diamond_shape
      ? { label: "Diamond Shape:", value: selectedDiamondShape?.name || diamondShapeData?.name || product.diamond_shape }
      : null,
    product.diamond_weight ? { label: "Diamond Weight:", value: `${product.diamond_weight} ct` } : null,
    product.diamond_quality ? { label: "Diamond Quality:", value: product.diamond_quality } : null,
    product.setting_style ? { label: "Setting Style:", value: product.setting_style } : null,
  ].filter(Boolean);

  const hasDetailData = itemDetailRows.length > 0 || diamondInfoRows.length > 0;

  const makeSlug = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const formatTitle = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const rawColName = product.collection_name || product.collection || "";
  const rawCatName = product.category_name || product.category || "";

  const colSlug = product.collection_slug || makeSlug(rawColName) || "jewellery";
  const colName = rawColName ? formatTitle(rawColName) : "Jewellery";

  const catSlug = product.category_slug || makeSlug(rawCatName);
  const catName = rawCatName ? formatTitle(rawCatName) : "";

  const showCategory = catName && makeSlug(catName) !== makeSlug(colName);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link href={`/collection/${colSlug}`} className="hover:text-black transition-colors">
            {colName}
          </Link>
          {showCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <Link href={`/collection/${colSlug}/${catSlug}`} className="hover:text-black transition-colors">
                {catName}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-800 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main Container: Left Media Grid + Right Options Panel */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-6 max-w-xl mx-auto lg:mx-0 w-full space-y-3.5">
            
            {/* Desktop View: Grid Layout (lg screens and above ONLY) */}
            <div className="hidden lg:block space-y-3.5">
              {/* 1. Primary Main Thumbnail */}
              <div className="w-full bg-white aspect-[4/3] sm:aspect-square max-h-[420px] border border-gray-200/80 rounded-xl p-3 sm:p-6 flex items-center justify-center overflow-hidden shadow-2xs mx-auto">
                {displayImages[0] ? (
                  <CustomImg
                    srcAttr={displayImages[0]}
                    altAttr={product.name}
                    width={700}
                    height={700}
                    className="w-full h-full object-contain"
                    priority
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <Package className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">No Image Available</span>
                  </div>
                )}
              </div>

              {/* 2. Sub-images & Video Grid */}
              {(displayImages.length > 1 || videoUrl) && (
                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  {/* Remaining Sub-images */}
                  {displayImages.slice(1).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="w-full bg-white aspect-square max-h-[210px] flex items-center justify-center p-2.5 sm:p-3 border border-gray-200/80 rounded-xl overflow-hidden shadow-2xs"
                    >
                      <CustomImg
                        srcAttr={imgUrl}
                        altAttr={`${product.name} view ${idx + 2}`}
                        width={400}
                        height={400}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}

                  {/* Uploaded Video Card in Grid */}
                  {videoUrl && (
                    <div className="w-full bg-black aspect-square max-h-[210px] flex items-center justify-center border border-gray-900 rounded-xl overflow-hidden relative shadow-2xs">
                      <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/20">
                        <Play className="w-2.5 h-2.5 fill-white text-white" />
                        <span>Video</span>
                      </div>
                      <video
                        src={videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile / Tablet View: Interactive Media Slider (< lg screens) */}
            <div className="block lg:hidden w-full space-y-3">
              <div className="relative w-full aspect-square bg-white border border-gray-200/80 rounded-xl p-4 flex items-center justify-center overflow-hidden shadow-2xs">
                {allMediaItems.length > 0 ? (
                  allMediaItems[activeMediaIndex]?.type === "video" ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black rounded-lg overflow-hidden">
                      <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/20">
                        <Play className="w-2.5 h-2.5 fill-white text-white" />
                        <span>Video</span>
                      </div>
                      <video
                        src={allMediaItems[activeMediaIndex].url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <CustomImg
                      srcAttr={allMediaItems[activeMediaIndex]?.url || displayImages[0]}
                      altAttr={product.name}
                      width={600}
                      height={600}
                      className="w-full h-full object-contain"
                      priority
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                    <Package className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">No Image Available</span>
                  </div>
                )}

                {/* Prev / Next Slider Navigation Arrows */}
                {allMediaItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : allMediaItems.length - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-colors cursor-pointer z-10"
                      aria-label="Previous media item"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaIndex((prev) => (prev < allMediaItems.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-colors cursor-pointer z-10"
                      aria-label="Next media item"
                    >
                      <ChevronRight className="w-5 h-5 stroke-[2]" />
                    </button>
                  </>
                )}
              </div>

              {/* Horizontal Scrollable Thumbnails Selector for Mobile/Tablet Slider */}
              {allMediaItems.length > 1 && (
                <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-1">
                  {allMediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`w-14 h-14 rounded-lg border-2 overflow-hidden bg-white shrink-0 p-1 transition-all cursor-pointer relative ${
                        activeMediaIndex === idx ? "border-[#202A4E] shadow-sm scale-105" : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full bg-black rounded flex items-center justify-center relative">
                          <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      ) : (
                        <CustomImg
                          srcAttr={item.url}
                          altAttr={`Thumbnail ${idx + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Options Panel */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-5 pt-1">
            
            {/* Title & Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-canela font-normal text-gray-900 tracking-tight leading-snug">
                {product.name}
              </h1>
              <div className="text-xl sm:text-2xl font-normal text-gray-900 mt-2">
                ₹{parseFloat(displayPrice).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Separator Divider */}
            <div className="w-full h-px bg-gray-200/80 my-4" />

            {/* 1. Quantity Counter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Qty:</label>
              <div className="flex items-center border border-gray-300 w-28 h-10 bg-white">
                <button
                  type="button"
                  onClick={() => dispatch(decrementQuantity())}
                  className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-black text-lg select-none cursor-pointer"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium text-sm text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => dispatch(incrementQuantity())}
                  className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-black text-lg select-none cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. Gold Karat Options */}
            {puritiesToDisplay.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-900">Gold Karat:</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {puritiesToDisplay.map((purity) => {
                    const purityVal = purity.carat || purity.name || purity;
                    const activePurity = selectedPurity || puritiesToDisplay[0];
                    const isSelected =
                      activePurity?.id === purity.id ||
                      activePurity?.carat === purityVal ||
                      activePurity?.name === purityVal ||
                      activePurity === purityVal;
                    return (
                      <button
                        key={purity.id || purityVal}
                        type="button"
                        onClick={() => dispatch(setSelectedPurity(purity))}
                        className={`px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-[#F7EFE5] text-gray-900 border-[#202A4E]"
                            : "bg-transparent text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {purityVal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Gold Color Swatches */}
            {colorsToDisplay.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-900">Gold Color:</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {colorsToDisplay.map((col) => {
                    const activeColor = selectedColor || colorsToDisplay[0];
                    const isSelected =
                      activeColor?.id === col.id ||
                      activeColor?.name === col.name;
                    return (
                      <button
                        key={col.id || col.name}
                        type="button"
                        onClick={() => dispatch(setSelectedColor(col))}
                        className={`px-4 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-[#F7EFE5] text-gray-900 border-[#202A4E]"
                            : "bg-transparent text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0 inline-block shadow-2xs"
                          style={{ backgroundColor: col.hex_code || col.hex || "#E5C158" }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Chosen Diamond Shape Options */}
            {diamondShapesToDisplay.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-900">Diamond Shape:</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {diamondShapesToDisplay.map((shape) => {
                    const activeShape = selectedDiamondShape || diamondShapesToDisplay[0];
                    const isSelected =
                      activeShape?.id === shape.id ||
                      activeShape?.name === shape.name;
                    return (
                      <button
                        key={shape.id || shape.name}
                        type="button"
                        onClick={() => dispatch(setSelectedDiamondShape(shape))}
                        className={`px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? "bg-[#F7EFE5] text-gray-900 border-[#202A4E]"
                            : "bg-transparent text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {(shape.img || shape.image) && (
                          <img src={shape.img || shape.image} alt={shape.name} className="w-5 h-5 object-contain" />
                        )}
                        <span>{shape.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Ring Size Options */}
            {ringSizesList.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-900">Ring Size:</label>
                <select
                  value={selectedRingSize}
                  onChange={(e) => dispatch(setSelectedRingSize(e.target.value))}
                  className="w-36 h-10 border border-gray-300 px-3 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:border-black cursor-pointer rounded-none"
                >
                  {ringSizesList.map((item) => {
                    const val = item.name || item.size_in_mm || item;
                    return (
                      <option key={item.id || val} value={val}>
                        {val}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Add to Bag CTA Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleAddToBag}
                className="w-full bg-[#202A4E] text-white font-bold tracking-widest py-4 uppercase text-sm sm:text-base flex items-center justify-center gap-2 rounded-none cursor-pointer hover:bg-black transition-colors"
              >
                {addedToBag ? (
                  <>
                    <Check className="w-5 h-5 text-white" /> ADDED TO BAG
                  </>
                ) : (
                  "ADD TO BAG"
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Accordions & Trust Features Container */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-gray-200">
          
          {/* Description Accordion */}
          {product.description && (
            <div className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="w-full py-5 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
              >
                <h2 className="text-xl sm:text-2xl font-canela font-normal text-gray-900">
                  Description
                </h2>
                <div className="text-gray-600 group-hover:text-black transition-colors">
                  {isDescriptionOpen ? (
                    <Minus className="w-5 h-5 stroke-[1.5]" />
                  ) : (
                    <Plus className="w-5 h-5 stroke-[1.5]" />
                  )}
                </div>
              </button>
              {isDescriptionOpen && (
                <div className="pb-6 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-5xl font-sans">
                  {product.description}
                </div>
              )}
            </div>
          )}

          {/* Detail Accordion */}
          {hasDetailData && (
            <div className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => setIsDetailOpen(!isDetailOpen)}
                className="w-full py-5 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
              >
                <h2 className="text-xl sm:text-2xl font-canela font-normal text-gray-900">
                  Detail
                </h2>
                <div className="text-gray-600 group-hover:text-black transition-colors">
                  {isDetailOpen ? (
                    <Minus className="w-5 h-5 stroke-[1.5]" />
                  ) : (
                    <Plus className="w-5 h-5 stroke-[1.5]" />
                  )}
                </div>
              </button>

              {isDetailOpen && (
                <div className="pb-8 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
                    
                    {/* Item Details Column */}
                    {itemDetailRows.length > 0 && (
                      <div>
                        <h3 className="text-base font-canela font-normal text-gray-900 mb-4">
                          Item Details
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs sm:text-sm font-sans">
                          {itemDetailRows.map((row, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between">
                              <span className="text-gray-900">{row.label}</span>
                              <span className="text-gray-600 font-medium">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Diamond Information Column */}
                    {diamondInfoRows.length > 0 && (
                      <div>
                        <h3 className="text-base font-canela font-normal text-gray-900 mb-4">
                          Diamond Information
                        </h3>
                        <div className="divide-y divide-gray-100 text-xs sm:text-sm font-sans">
                          {diamondInfoRows.map((row, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between">
                              <span className="text-gray-900">{row.label}</span>
                              <span className="text-gray-600 font-medium">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trust Features Bar */}
          <div className="pt-16 pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-center text-center">
              {trustFeatures.map((feat) => (
                <div key={feat.id} className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Image
                      src={feat.icon}
                      alt={feat.title}
                      width={48}
                      height={48}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-800 max-w-[120px] leading-snug">
                    {feat.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
