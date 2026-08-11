"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, Loader2, Check, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import CustomImg from "@/components/CustomImg";
import { supabase } from "@/lib/db";

export default function ProductDetailPage({ params }) {
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      if (resolved?.id) {
        setProductId(resolved.id);
      }
    });
  }, [params]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const [
          { data: prodData, error: prodErr },
          { data: mediaData, error: mediaErr },
          { data: colorData, error: colorErr },
        ] = await Promise.all([
          supabase.from("products").select("*").eq("id", productId).single(),
          supabase.from("media_mapping").select("*").eq("product_id", productId),
          supabase.from("colors").select("*"),
        ]);

        if (prodData) {
          setProduct(prodData);
          setMediaList(mediaData || []);

          // Map colors
          const colorMap = {};
          (colorData || []).forEach((c) => (colorMap[c.id] = c));
          const availableColors = (mediaData || [])
            .map((m) => colorMap[m.color_id])
            .filter(Boolean);
          
          const uniqueColors = Array.from(
            new Set(availableColors.map((c) => c.id))
          ).map((id) => availableColors.find((c) => c.id === id));

          setColors(uniqueColors);
          if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0]);

          const mainImg = mediaData?.[0]?.thumbnail || mediaData?.[0]?.image_url || prodData.image || "";
          setActiveImage(mainImg);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // When color changes, update active image if matching media exists
  const handleColorSelect = (col) => {
    setSelectedColor(col);
    const match = mediaList.find((m) => m.color_id === col.id);
    if (match) {
      setActiveImage(match.thumbnail || match.image_url || activeImage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-3 p-12">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <p className="text-xs font-semibold text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center space-y-4 p-12 text-center">
        <h2 className="text-xl font-serif font-bold text-gray-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/collection"
          className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 font-sans pb-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider overflow-x-auto">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <Link href="/collection" className="hover:text-black transition-colors">
              Collections
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-black font-extrabold truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Detail Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black uppercase tracking-wider mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Product Media Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square w-full bg-[#FAF9F6] rounded-2xl border border-gray-100 overflow-hidden p-6 flex items-center justify-center">
              {activeImage ? (
                <CustomImg
                  srcAttr={activeImage}
                  altAttr={product.name}
                  titleAttr={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-xs text-gray-400">No Image Available</div>
              )}
            </div>

            {/* Media Thumbnails Row */}
            {mediaList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {mediaList.map((m, idx) => {
                  const url = m.thumbnail || m.image_url;
                  const isSelected = activeImage === url;
                  return (
                    <button
                      key={m.id || idx}
                      onClick={() => setActiveImage(url)}
                      className={`w-16 h-16 rounded-xl border p-1 overflow-hidden transition-all cursor-pointer ${
                        isSelected ? "border-black ring-2 ring-black/20" : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <CustomImg
                        srcAttr={url}
                        altAttr={product.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Product Information & Purchase Actions */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {product.sku && (
                <span className="inline-block font-mono bg-gray-100 px-2.5 py-1 rounded text-xs text-gray-600 font-bold">
                  SKU: {product.sku}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
                  ₹{parseFloat(product.price || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-gray-500 font-semibold">Taxes included</span>
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Metal Color: <span className="text-black font-extrabold">{selectedColor?.name}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {colors.map((col) => {
                      const isSelected = selectedColor?.id === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => handleColorSelect(col)}
                          className={`w-8 h-8 rounded-full border border-gray-300 transition-all cursor-pointer flex items-center justify-center ${
                            isSelected ? "ring-2 ring-black ring-offset-2 scale-110" : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: col.hex_code || col.hex || "#FFD700" }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-gray-800 drop-shadow-xs" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Description</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-sans">{product.description}</p>
                </div>
              )}

              {/* Badges / Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-bold text-gray-700">100% Certified</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-bold text-gray-700">Insured Shipping</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-bold text-gray-700">Easy Returns</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/appointment"
                className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider text-center hover:bg-gray-900 transition-all shadow-md"
              >
                Book Appointment To View
              </Link>
              <Link
                href="/contact"
                className="w-full sm:flex-1 py-3 px-6 rounded-xl border border-black text-black text-xs font-bold uppercase tracking-wider text-center hover:bg-black hover:text-white transition-all"
              >
                Inquire Product
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
