"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/productCard";
import { fetchLatestProductsByCollectionService } from "@/lib/productService";

export default function LatestArrivalsSection({
  collectionName = "all",
  title = "",
  subtitle = "Discover our newest handcrafted arrivals.",
  limit = 8,
  className = "",
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState(null);

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

  // Compute dynamic section title
  const displayTitle =
    title ||
    (collectionInfo?.name
      ? `Latest ${collectionInfo.name} Arrivals`
      : collectionName && collectionName.toLowerCase() !== "all"
      ? `Latest ${collectionName} Arrivals`
      : "Latest Product Arrivals");

  const shopUrl =
    collectionInfo?.id
      ? `/shop?collection=${collectionInfo.id}`
      : collectionName && collectionName.toLowerCase() !== "all"
      ? `/shop?search=${encodeURIComponent(collectionName)}`
      : "/shop";

  return (
    <section className={`py-12 sm:py-16 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto ${className}`}>
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 border-b border-gray-100 pb-4 gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-canela text-gray-900 font-normal leading-tight">
            {displayTitle}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 font-sans">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={shopUrl}
          className="text-xs font-semibold tracking-wider text-amber-900 hover:text-black uppercase transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>View All</span>
          <span className="text-sm">&rarr;</span>
        </Link>
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: limit > 4 ? 4 : limit }).map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-100 animate-pulse rounded-xl h-72 w-full flex flex-col justify-between p-4"
            >
              <div className="bg-gray-200 rounded-lg h-40 w-full mb-3" />
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
              <div className="bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        /* Product Cards Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium">
            No products found for {collectionName !== "all" ? `"${collectionName}"` : "this section"}.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-3 text-xs font-bold text-amber-900 underline uppercase"
          >
            Explore All Jewelry
          </Link>
        </div>
      )}
    </section>
  );
}
