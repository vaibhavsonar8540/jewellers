"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowLeft, Loader2, Check, Plus, Minus } from "lucide-react";
import CustomImg from "@/components/CustomImg";
import { supabase } from "@/lib/db";
import { useCart } from "@/context/CartContext";

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

export default function ProductDetailPage({ params }) {
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaList, setMediaList] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [productPurities, setProductPurities] = useState([]);
  const [ringSizesList, setRingSizesList] = useState([]);
  const [diamondShapeData, setDiamondShapeData] = useState(null);

  // User Selection States
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedPurity, setSelectedPurity] = useState(null);
  const [selectedRingSize, setSelectedRingSize] = useState("");
  const [addedToBag, setAddedToBag] = useState(false);
  const { addToCart } = useCart();

  // Accordion Toggle States
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      if (resolved?.id) {
        setProductId(resolved.id);
      }
    });
  }, [params]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const [
          { data: prodData },
          { data: mediaData },
          { data: colorData },
          { data: variationData },
          { data: purityData },
          { data: sizeData },
        ] = await Promise.all([
          supabase.from("products").select("*").eq("id", productId).single(),
          supabase.from("media_mapping").select("*").eq("product_id", productId),
          supabase.from("colors").select("*"),
          supabase.from("product_variations").select("*").eq("product_id", productId),
          supabase.from("purity").select("*"),
          supabase.from("ring_sizes").select("*"),
        ]);

        if (prodData) {
          setProduct(prodData);
          setMediaList(mediaData || []);

          // Fetch Diamond Shape details if exists
          if (prodData.diamond_shape_id) {
            const { data: shapeData } = await supabase
              .from("diamond_shapes")
              .select("*")
              .eq("id", prodData.diamond_shape_id)
              .single();
            if (shapeData) setDiamondShapeData(shapeData);
          }

          // 1. Process Colors uploaded for this product
          const colorMap = {};
          (colorData || []).forEach((c) => (colorMap[c.id] = c));

          const uploadedColorIds = new Set([
            ...(mediaData || []).map((m) => m.color_id),
            ...(variationData || []).map((v) => v.color_id),
          ]);

          const availableColors = Array.from(uploadedColorIds)
            .map((id) => colorMap[id])
            .filter(Boolean);

          setProductColors(availableColors);
          if (availableColors.length > 0) {
            setSelectedColor(availableColors[0]);
          }

          // 2. Process Purities / Gold Types uploaded for this product
          const purityMap = {};
          (purityData || []).forEach((p) => (purityMap[p.id] = p));

          const uploadedPurityIds = new Set(
            (variationData || []).map((v) => v.purity_id)
          );

          const availablePurities = Array.from(uploadedPurityIds)
            .map((id) => purityMap[id])
            .filter(Boolean);

          setProductPurities(availablePurities);
          if (availablePurities.length > 0) {
            setSelectedPurity(availablePurities[0]);
          }

          // 3. Process Ring Sizes (only if available)
          if (sizeData && sizeData.length > 0) {
            setRingSizesList(sizeData);
            setSelectedRingSize(sizeData[0].name || sizeData[0].size_in_mm || "");
          } else if (prodData.size) {
            setRingSizesList([{ id: "1", name: prodData.size }]);
            setSelectedRingSize(prodData.size);
          } else {
            setRingSizesList([]);
            setSelectedRingSize("");
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleAddToBag = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      color: selectedColor?.name || "",
      purity: selectedPurity?.carat || "",
      ringSize: selectedRingSize || "",
      sku: product.sku || "",
      diamondType: product.diamond_type || "",
      diamondShape: diamondShapeData?.name || "",
      diamondQuality: product.diamond_quality || "",
      quantity: quantity,
    });
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-3 p-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-800" />
        <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 p-12 text-center">
        <h2 className="text-2xl font-canela font-normal text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-[#202A4E] text-white text-xs font-semibold uppercase tracking-widest inline-flex items-center gap-2 hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  // 4. Compute Gallery Images (Only Uploaded Images)
  let uploadedImages = [];

  if (selectedColor) {
    const matchingMedia = mediaList.find((m) => m.color_id === selectedColor.id);
    if (matchingMedia) {
      if (matchingMedia.thumbnail) uploadedImages.push(matchingMedia.thumbnail);
      if (Array.isArray(matchingMedia.images)) {
        matchingMedia.images.forEach((img) => {
          if (img && !uploadedImages.includes(img)) uploadedImages.push(img);
        });
      }
    }
  }

  // Fallback to all uploaded media if no color-specific match
  if (uploadedImages.length === 0) {
    mediaList.forEach((m) => {
      if (m.thumbnail && !uploadedImages.includes(m.thumbnail)) uploadedImages.push(m.thumbnail);
      if (Array.isArray(m.images)) {
        m.images.forEach((img) => {
          if (img && !uploadedImages.includes(img)) uploadedImages.push(img);
        });
      }
    });
  }

  // Final fallback to main product image if media_mapping empty
  if (uploadedImages.length === 0 && product.image) {
    uploadedImages.push(product.image);
  }

  const mainImage = uploadedImages[0] || "";
  const subImages = uploadedImages.slice(1);

  // Filter non-null Detail Rows (no static dummy fallbacks!)
  const itemDetailRows = [
    product.sku ? { label: "SKU:", value: product.sku } : null,
    selectedPurity?.carat ? { label: "Metal Type:", value: selectedPurity.carat } : null,
    selectedColor?.name ? { label: "Metal Color:", value: selectedColor.name } : null,
    selectedRingSize || product.size ? { label: "Ring Size:", value: selectedRingSize || product.size } : null,
    product.weight || product.approx_weight
      ? {
          label: "Approx Weight:",
          value:
            typeof (product.weight || product.approx_weight) === "number" ||
            !String(product.weight || product.approx_weight).toLowerCase().includes("g")
              ? `${product.weight || product.approx_weight} gm`
              : product.weight || product.approx_weight,
        }
      : null,
    product.length ? { label: "Length:", value: product.length } : null,
  ].filter(Boolean);

  const diamondInfoRows = [
    product.diamond_type ? { label: "Diamond Type:", value: product.diamond_type } : null,
    diamondShapeData?.name ? { label: "Diamond Shape:", value: diamondShapeData.name } : null,
    product.diamond_quality ? { label: "Diamond Quality:", value: product.diamond_quality } : null,
    product.carat_weight || product.total_carat_weight
      ? {
          label: "Total Carat Weight:",
          value:
            typeof (product.carat_weight || product.total_carat_weight) === "number" ||
            !String(product.carat_weight || product.total_carat_weight).toLowerCase().includes("ct")
              ? `${product.carat_weight || product.total_carat_weight} ctw`
              : product.carat_weight || product.total_carat_weight,
        }
      : null,
    product.setting_style ? { label: "Setting Style:", value: product.setting_style } : null,
  ].filter(Boolean);

  const hasDetailData = itemDetailRows.length > 0 || diamondInfoRows.length > 0;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Rings
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-800 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main Container: Left Media Grid + Right Options Panel */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Product Gallery Grid */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            {/* Featured Main Image */}
            <div className="w-full bg-white aspect-square flex items-center justify-center p-4 sm:p-8 border border-gray-100 overflow-hidden">
              {mainImage ? (
                <CustomImg
                  srcAttr={mainImage}
                  altAttr={product.name}
                  width={900}
                  height={900}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-gray-400">No Image Available</div>
              )}
            </div>

            {/* Sub-images */}
            {subImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {subImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="w-full bg-white aspect-square flex items-center justify-center p-3 sm:p-6 border border-gray-100 overflow-hidden"
                  >
                    <CustomImg
                      srcAttr={imgUrl}
                      altAttr={`${product.name} view ${idx + 1}`}
                      width={450}
                      height={450}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Options Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 pt-2">
            
            {/* Title & Price */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-canela font-normal text-gray-900 tracking-tight leading-snug">
                {product.name}
              </h1>
              <div className="text-2xl font-normal text-gray-900 mt-2">
                ₹{parseFloat(product.price || 0).toLocaleString("en-IN")}
              </div>
            </div>

            {/* Separator Divider */}
            <div className="w-full h-px bg-gray-200/80 my-5" />

            {/* Quantity Counter */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Qty:</label>
              <div className="flex items-center border border-gray-300 w-28 h-10 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-black text-lg select-none"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium text-sm text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-full flex items-center justify-center text-gray-600 hover:text-black text-lg select-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Gold Type */}
            {productPurities.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-900">Gold Type:</label>
                <div className="flex items-center gap-3">
                  {productPurities.map((purity) => {
                    const isSelected = selectedPurity?.id === purity.id;
                    return (
                      <button
                        key={purity.id}
                        type="button"
                        onClick={() => setSelectedPurity(purity)}
                        className={`px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[#F7EFE5] text-gray-900"
                            : "bg-transparent text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {purity.carat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gold Color Swatches */}
            {productColors.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-900">Gold Color:</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {productColors.map((col) => {
                    const isSelected = selectedColor?.id === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-4 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-[#F7EFE5] text-gray-900"
                            : "bg-transparent text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0 inline-block"
                          style={{ backgroundColor: col.hex_code || col.hex || "#E5C158" }}
                        />
                        <span>{col.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ring Size */}
            {ringSizesList.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="block text-sm font-semibold text-gray-900">Ring Size:</label>
                <select
                  value={selectedRingSize}
                  onChange={(e) => setSelectedRingSize(e.target.value)}
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
                className="w-full bg-[#202A4E] text-white font-bold tracking-widest py-4 uppercase text-sm sm:text-base flex items-center justify-center gap-2 rounded-none"
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
