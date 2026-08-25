"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/productCard";
import { fetchLatestProductsByCollectionService } from "@/lib/productService";

export default function LatestArrivalsSection({
  collectionName = "all",
  title = "Latest Arrivals",
  subtitle = "Discover our newest handcrafted arrivals.",
  limit = 10,
  className = "",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { data, collection } = await fetchLatestProductsByCollectionService(
          collectionName,
          limit
        );
        if (isMounted) {
          setProducts(data || []);
          setCollectionInfo(collection || null);
        }
      } catch (err) {
        console.error("Error loading latest arrivals:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [collectionName, limit]);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollAmount = clientWidth * 0.8;
      sliderRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const makeSlug = (str) =>
    (str || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  // Compute dynamic section title & collection URL
  const displayTitle = title || "Latest Arrivals";

  const rawColSlug = collectionInfo?.slug || collectionInfo?.name || (collectionName && collectionName.toLowerCase() !== "all" ? collectionName : "");
  const collectionUrl = rawColSlug
    ? `/collection/${makeSlug(rawColSlug)}`
    : "/collection";

  return (
    <section className={`pb-12 sm:pb-20 px-4 sm:px-8 lg:px-20 mx-auto ${className}`}>
      
      {/* Header Row with Title & View All Link */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-gray-100 pb-4 gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-canela text-gray-900 font-normal leading-tight">
            {displayTitle}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-sans">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={collectionUrl}
          className="text-xs sm:text-sm font-bold tracking-widest text-[#202A4E] hover:text-amber-800 uppercase transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          <span>View All</span>
          <span className="text-sm sm:text-base">&rarr;</span>
        </Link>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-100 animate-pulse rounded-xl h-72 w-[240px] sm:w-[280px] shrink-0 flex flex-col justify-between p-4"
            >
              <div className="bg-gray-200 rounded-lg h-40 w-full mb-3" />
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
              <div className="bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        /* Horizontal Product Slider Container with Centered Side Arrows */
        <div className="relative group">
          {/* Left Arrow Button (Centered Vertically on Cards) */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => scroll("left")}
            aria-label="Previous products"
            className="absolute left-1 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white/95 shadow-md hover:bg-gray-900 hover:text-white hover:border-gray-900 flex items-center justify-center text-gray-700 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slider */}
          <div
            ref={sliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="snap-start shrink-0 w-[68vw] xss:w-[240px] sm:w-[280px] lg:w-[300px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Right Arrow Button (Centered Vertically on Cards) */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => scroll("right")}
            aria-label="Next products"
            className="absolute right-1 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white/95 shadow-md hover:bg-gray-900 hover:text-white hover:border-gray-900 flex items-center justify-center text-gray-700 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium">
            No products found for {collectionName !== "all" ? `"${collectionName}"` : "this section"}.
          </p>
          <Link
            href="/collection"
            className="inline-block mt-3 text-xs font-bold text-amber-900 underline uppercase"
          >
            Explore All Jewelry
          </Link>
        </div>
      )}
    </section>
  );
}
