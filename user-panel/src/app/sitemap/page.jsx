import React from "react";
import Link from "next/link";
import { getSitemapMetadata } from "@/utils/pageMeta";
import { fetchActiveProductsService } from "@/lib/productService";
import {
  Compass,
  Layers,
  ShoppingBag,
  Info,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Package,
} from "lucide-react";

export async function generateMetadata() {
  return getSitemapMetadata();
}

const makeSlug = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default async function SitemapPage() {
  // Fetch active products, collections, categories, subcategories
  let collections = [];
  let categories = [];
  let subCategories = [];
  let products = [];

  try {
    const res = await fetchActiveProductsService();
    collections = res?.collections || [];
    categories = res?.categories || [];
    subCategories = res?.subCategories || [];
    products = res?.data || [];
  } catch (err) {
    console.error("HTML Sitemap data fetch error:", err);
  }

  // Build Collections Hierarchy Tree
  const navTree = collections.map((col) => {
    const colSlug = col.slug || makeSlug(col.name);

    const colCats = categories.filter(
      (cat) => cat.collection_id === col.id || cat.collection_name === col.name
    );

    const categoriesWithSubs = colCats.map((cat) => {
      const catSlug = cat.slug || makeSlug(cat.name);
      const subs = subCategories.filter(
        (sub) => sub.category_id === cat.id || sub.category_name === cat.name
      );

      return {
        ...cat,
        slug: catSlug,
        sub_categories: subs.map((s) => ({
          ...s,
          slug: s.slug || makeSlug(s.name),
        })),
      };
    });

    return {
      ...col,
      slug: colSlug,
      categories: categoriesWithSubs,
    };
  });

  // Main Static Pages
  const staticPages = [
    { name: "Home Page", path: "/", desc: "Main landing page & luxury featured showcases" },
    { name: "All Jewelry Collections", path: "/collection", desc: "Complete catalog of gold, diamond & fine jewelry" },
    { name: "Custom Jewelry Design", path: "/custom-jewelry", desc: "Bespoke jewelry creation with master artisans" },
    { name: "Book Private Appointment", path: "/appointment", desc: "Schedule consultation with expert jewelers" },
    { name: "About Us", path: "/about-us", desc: "Our heritage, ethical sourcing & craftsmanship" },
    { name: "Contact Us", path: "/contact", desc: "Customer service, store locator & inquiries" },
  ];

  // Policies & Information Pages
  const policyPages = [
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Terms & Conditions", path: "/terms-and-conditions" },
    { name: "Returns & Shipping", path: "/returns-shipping" },
    { name: "Payment & Financing", path: "/payment-and-financing" },
    { name: "Site Map Index", path: "/sitemap" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-900 font-sans pb-20">
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-900 font-semibold">Site Map</span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-[#1b233d] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <Compass className="w-3.5 h-3.5" />
            <span>Complete Website Index</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-canela font-normal text-white tracking-tight">
            Luxora HTML Sitemap
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Easily navigate through all pages, fine jewelry collections, subcategories, and individual product details.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        
        {/* Section 1: Main Pages & Services */}
        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-canela font-normal text-gray-900">
              Main Pages & Bespoke Services
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {staticPages.map((page) => (
              <Link
                key={page.path}
                href={page.path}
                className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-amber-700/40 transition-all group flex flex-col justify-between space-y-2"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-gray-900 group-hover:text-amber-800 transition-colors flex items-center justify-between">
                    <span>{page.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-gray-500 font-normal leading-relaxed">
                    {page.desc}
                  </p>
                </div>
                <span className="text-[11px] font-mono font-medium text-amber-900/80 pt-2 border-t border-gray-100">
                  {page.path}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Dynamic Jewelry Collections & Categories */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-canela font-normal text-gray-900">
                  Jewelry Collections & Categories
                </h2>
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {collections.length} Collections
            </span>
          </div>

          {navTree.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 space-y-2">
              <Package className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-sm font-semibold">No collections loaded</p>
              <Link href="/collection" className="text-xs text-amber-800 hover:underline">
                View All Collections &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {navTree.map((col) => (
                <div
                  key={col.id || col.slug}
                  className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Collection Header Link */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <Link
                        href={`/collection/${col.slug}`}
                        className="font-canela font-normal text-xl text-gray-900 hover:text-amber-800 transition-colors uppercase tracking-tight flex items-center gap-1.5"
                      >
                        <span>{col.name}</span>
                      </Link>
                      <Link
                        href={`/collection/${col.slug}`}
                        className="text-[11px] font-bold text-amber-800 uppercase hover:underline"
                      >
                        Explore &rarr;
                      </Link>
                    </div>

                    {/* Categories & Subcategories list */}
                    {col.categories && col.categories.length > 0 ? (
                      <div className="space-y-3.5">
                        {col.categories.map((cat) => (
                          <div key={cat.id || cat.slug} className="space-y-1.5 pl-1">
                            <Link
                              href={`/collection/${col.slug}/${cat.slug}`}
                              className="text-sm font-semibold text-gray-900 hover:text-amber-800 transition-colors flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                              <span>{cat.name}</span>
                            </Link>

                            {/* Subcategories list */}
                            {cat.sub_categories && cat.sub_categories.length > 0 && (
                              <div className="pl-4 flex flex-wrap gap-1.5 pt-0.5">
                                {cat.sub_categories.map((sub) => (
                                  <Link
                                    key={sub.id || sub.slug}
                                    href={`/collection/${col.slug}/${cat.slug}/${sub.slug}`}
                                    className="text-[11px] font-medium bg-gray-50 hover:bg-amber-50 hover:text-amber-900 text-gray-600 px-2 py-0.5 rounded border border-gray-200 transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Browse all exquisite designs in {col.name}.
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>URL: /collection/{col.slug}</span>
                    <Link
                      href={`/collection/${col.slug}`}
                      className="font-semibold text-black hover:text-amber-800"
                    >
                      View All Products
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Active Products Directory */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-canela font-normal text-gray-900">
                Active Fine Jewelry Items ({products.length})
              </h2>
            </div>
            <Link
              href="/collection"
              className="text-xs font-bold text-amber-800 hover:underline uppercase"
            >
              Shop All Products &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/90 p-5 shadow-2xs">
            {products.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No products available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                {products.map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/product/${prod.id}`}
                    className="p-2.5 rounded-lg border border-gray-100 hover:border-amber-400 hover:bg-amber-50/30 transition-all text-xs font-medium text-gray-800 truncate flex items-center justify-between group"
                  >
                    <span className="truncate group-hover:text-amber-800">{prod.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Customer Information & Policies */}
        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-canela font-normal text-gray-900">
              Policies & Customer Support
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {policyPages.map((policy) => (
              <Link
                key={policy.path}
                href={policy.path}
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-black text-center transition-all group"
              >
                <span className="text-xs font-semibold text-gray-900 group-hover:text-amber-800 transition-colors block">
                  {policy.name}
                </span>
                <span className="text-[10px] text-gray-400 block pt-1">{policy.path}</span>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}