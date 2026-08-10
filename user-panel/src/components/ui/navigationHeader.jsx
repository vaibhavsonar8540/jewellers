"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomImg from "@/components/CustomImg";
import { supabase } from "@/lib/db";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Loader2,
  Layers,
} from "lucide-react";

// Default Fallback Hierarchy matching the uploaded design
const DEFAULT_HIERARCHY = [
  {
    id: "jewelry",
    name: "JEWELRY",
    slug: "jewelry",
    image_url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80",
    featured_caption: "Discover dazzling diamond deals, expertly crafted and perfectly priced for every occasion.",
    featured_link_text: "Deals of the Week",
    categories: [
      {
        id: "cat-rings",
        name: "Rings",
        slug: "rings",
        sub_categories: [
          { id: "sub-1", name: "Anniversary Rings", slug: "anniversary-rings" },
          { id: "sub-2", name: "High Jewelry", slug: "high-jewelry" },
          { id: "sub-3", name: "Fashion Rings", slug: "fashion-rings" },
        ],
      },
      {
        id: "cat-earrings",
        name: "Earrings",
        slug: "earrings",
        sub_categories: [
          { id: "sub-4", name: "Hoops", slug: "hoops" },
          { id: "sub-5", name: "Studs", slug: "studs" },
          { id: "sub-6", name: "Fashion", slug: "fashion-earrings" },
        ],
      },
      {
        id: "cat-necklaces",
        name: "Necklaces",
        slug: "necklaces",
        sub_categories: [
          { id: "sub-7", name: "Necklace", slug: "necklace" },
          { id: "sub-8", name: "Pendants", slug: "pendants" },
          { id: "sub-9", name: "Fashion", slug: "fashion-necklaces" },
        ],
      },
      {
        id: "cat-bracelets",
        name: "Bracelets",
        slug: "bracelets",
        sub_categories: [
          { id: "sub-10", name: "Tennis", slug: "tennis-bracelets" },
          { id: "sub-11", name: "Fashion", slug: "fashion-bracelets" },
        ],
      },
      {
        id: "cat-mens",
        name: "Men's Jewelry",
        slug: "mens-jewelry",
        sub_categories: [
          { id: "sub-12", name: "Rings", slug: "mens-rings" },
          { id: "sub-13", name: "Bracelets", slug: "mens-bracelets" },
          { id: "sub-14", name: "Pendants", slug: "mens-pendants" },
          { id: "sub-15", name: "Chain", slug: "mens-chains" },
        ],
      },
    ],
  },
  {
    id: "engagement",
    name: "ENGAGEMENT",
    slug: "engagement",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
    featured_caption: "Timeless engagement rings handcrafted with certified GIA solitaire diamonds.",
    featured_link_text: "Bridal Specials",
    categories: [
      {
        id: "cat-solitaire",
        name: "Solitaire Rings",
        slug: "solitaire-rings",
        sub_categories: [
          { id: "sub-20", name: "Round Cut", slug: "round-cut" },
          { id: "sub-21", name: "Oval Cut", slug: "oval-cut" },
          { id: "sub-22", name: "Princess Cut", slug: "princess-cut" },
        ],
      },
      {
        id: "cat-halo",
        name: "Halo Rings",
        slug: "halo-rings",
        sub_categories: [
          { id: "sub-23", name: "Single Halo", slug: "single-halo" },
          { id: "sub-24", name: "Double Halo", slug: "double-halo" },
          { id: "sub-25", name: "Hidden Halo", slug: "hidden-halo" },
        ],
      },
    ],
  },
  {
    id: "wedding",
    name: "WEDDING",
    slug: "wedding",
    image_url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80",
    featured_caption: "Matching wedding bands and diamond eternity rings for modern couples.",
    featured_link_text: "Explore Wedding Bands",
    categories: [
      {
        id: "cat-women-wedding",
        name: "Women's Bands",
        slug: "womens-wedding-bands",
        sub_categories: [
          { id: "sub-30", name: "Eternity Bands", slug: "eternity-bands" },
          { id: "sub-31", name: "Contour Bands", slug: "contour-bands" },
        ],
      },
      {
        id: "cat-men-wedding",
        name: "Men's Bands",
        slug: "mens-wedding-bands",
        sub_categories: [
          { id: "sub-32", name: "Gold Bands", slug: "gold-bands" },
          { id: "sub-33", name: "Platinum Bands", slug: "platinum-bands" },
        ],
      },
    ],
  },
  {
    id: "flash-deals",
    name: "FLASH DEALS",
    slug: "flash-deals",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    featured_caption: "Limited-time offers on fine diamond necklaces and solitaire pendants.",
    featured_link_text: "Shop Flash Deals",
    categories: [],
  },
  {
    id: "custom",
    name: "CUSTOM",
    slug: "custom",
    image_url: "https://images.unsplash.com/photo-1611591475140-7e3e9d7c3127?w=800&auto=format&fit=crop&q=80",
    featured_caption: "Bespoke jewelry creation tailored to your exact style and specifications.",
    featured_link_text: "Book Custom Design",
    categories: [],
  },
];

export default function NavigationHeader() {
  const [navTree, setNavTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHoverId, setActiveHoverId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState(null);

  // Fetch Collections, Categories, and Sub-Categories from Supabase
  useEffect(() => {
    const fetchNavigationData = async () => {
      setLoading(true);
      try {
        const [
          { data: dbCollections, error: colErr },
          { data: dbCategories, error: catErr },
          { data: dbSubCategories, error: subErr },
        ] = await Promise.all([
          supabase.from("collections").select("*").order("created_at", { ascending: true }),
          supabase.from("categories").select("*").order("created_at", { ascending: true }),
          supabase.from("sub_categories").select("*").order("created_at", { ascending: true }),
        ]);

        if (colErr) console.warn("Supabase collections fetch notice:", colErr);
        if (catErr) console.warn("Supabase categories fetch notice:", catErr);
        if (subErr) console.warn("Supabase subcategories fetch notice:", subErr);

        if (dbCollections && dbCollections.length > 0) {
          const tree = dbCollections.map((col) => {
            const colCats = (dbCategories || []).filter(
              (cat) => cat.collection_id === col.id || cat.collection_name === col.name
            );

            const categoriesWithSubs = colCats.map((cat) => {
              const subs = (dbSubCategories || []).filter(
                (sub) => sub.category_id === cat.id || sub.category_name === cat.name
              );
              return {
                ...cat,
                sub_categories: subs,
              };
            });

            // Find matching default template if available to provide featured caption/link
            const matchDefault = DEFAULT_HIERARCHY.find(
              (d) => d.name.toLowerCase() === col.name.toLowerCase() || d.slug === col.slug
            );

            return {
              ...col,
              name: col.name.toUpperCase(),
              image_url: col.image_url || matchDefault?.image_url || DEFAULT_HIERARCHY[0].image_url,
              featured_caption: matchDefault?.featured_caption || `Discover exquisite ${col.name} designs, expertly crafted for every occasion.`,
              featured_link_text: matchDefault?.featured_link_text || `Shop ${col.name}`,
              categories: categoriesWithSubs,
            };
          });

          // Merge default hierarchy items if DB has fewer than 3 items
          if (tree.length < 3) {
            setNavTree([...tree, ...DEFAULT_HIERARCHY.slice(tree.length)]);
          } else {
            setNavTree(tree);
          }
        } else {
          setNavTree(DEFAULT_HIERARCHY);
        }
      } catch (err) {
        console.error("Error building navigation tree:", err);
        setNavTree(DEFAULT_HIERARCHY);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationData();
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 font-sans relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Horizontal Nav Links Row */}
        <div className="hidden lg:flex items-center justify-center gap-8 xl:gap-12 py-3">
          {loading ? (
            <div className="flex items-center gap-3 py-1 text-xs text-gray-400 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
              <span>Loading Collections...</span>
            </div>
          ) : (
            navTree.map((item) => {
              const hasCategories = item.categories && item.categories.length > 0;
              const isHovered = activeHoverId === item.id;

              return (
                <div
                  key={item.id || item.slug}
                  className="static group"
                  onMouseEnter={() => setActiveHoverId(item.id)}
                  onMouseLeave={() => setActiveHoverId(null)}
                >
                  <Link
                    href={`/shop?collection=${item.slug || item.id}`}
                    className={`text-xs xl:text-sm font-semibold tracking-wider py-2 transition-all cursor-pointer uppercase font-sans ${
                      isHovered
                        ? "text-black font-extrabold border-b-2 border-black pb-1.5"
                        : "text-gray-700 hover:text-black"
                    }`}
                  >
                    {item.name}
                  </Link>

                  {/* Mega-Menu 100% Full-Width White Div Dropdown Panel */}
                  {hasCategories && isHovered && (
                    <div className="absolute left-0 right-0 w-full bg-white border-y border-gray-200 shadow-2xl z-50 animate-in fade-in duration-150 top-full">
                      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8 text-left bg-white">
                        
                        {/* Categories Columns (Left 7-8 Cols) */}
                        <div className="col-span-8 grid grid-cols-5 gap-6">
                          {item.categories.map((cat, idx) => (
                            <div key={cat.id || idx} className="flex flex-col justify-between space-y-3">
                              <div>
                                <h4 className="font-serif font-bold text-sm text-gray-900 mb-2.5 tracking-wide">
                                  {cat.name}
                                </h4>

                                {cat.sub_categories && cat.sub_categories.length > 0 ? (
                                  <ul className="space-y-1.5">
                                    {cat.sub_categories.map((sub, sIdx) => (
                                      <li key={sub.id || sIdx}>
                                        <Link
                                          href={`/shop?subcategory=${sub.slug || sub.id}`}
                                          className="text-xs text-gray-600 hover:text-black transition-colors block font-sans"
                                        >
                                          {sub.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">Explore {cat.name}</p>
                                )}
                              </div>

                              {/* View All Button per Category */}
                              <div className="pt-2">
                                <Link
                                  href={`/shop?category=${cat.slug || cat.id}`}
                                  className="inline-block bg-[#1E2E48] hover:bg-black text-white text-[11px] font-semibold px-4 py-1.5 rounded-xs transition-colors shadow-2xs tracking-wide"
                                >
                                  View All
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Right Collection Banner & Image Column (4 Cols) */}
                        <div className="col-span-4 pl-4 border-l border-gray-100 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="overflow-hidden rounded-xs border border-gray-100 max-h-[190px]">
                              <CustomImg
                                srcAttr={item.image_url}
                                altAttr={item.name}
                                titleAttr={item.name}
                                width={400}
                                height={240}
                                className="w-full h-44 object-cover hover:scale-103 transition-transform duration-300"
                              />
                            </div>
                            <p className="text-xs text-gray-600 font-sans italic leading-relaxed">
                              {item.featured_caption}
                            </p>
                          </div>

                          <div className="pt-2">
                            <Link
                              href={`/shop?collection=${item.slug || item.id}`}
                              className="font-semibold text-xs text-gray-900 hover:text-black underline underline-offset-4 tracking-wide uppercase"
                            >
                              {item.featured_link_text || "Shop Collection"}
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Static Links */}
          <Link
            href="/custom-jewelry"
            className="text-xs xl:text-sm font-semibold tracking-wider py-2 text-gray-700 hover:text-black transition-all uppercase font-sans shrink-0"
          >
            CUSTOM JEWELRY
          </Link>
          <Link
            href="/about-us"
            className="text-xs xl:text-sm font-semibold tracking-wider py-2 text-gray-700 hover:text-black transition-all uppercase font-sans shrink-0"
          >
            ABOUT US
          </Link>
        </div>

        {/* Mobile Navigation Bar Header Trigger */}
        <div className="lg:hidden flex items-center justify-between py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-100 text-gray-900 text-xs font-bold tracking-wider uppercase cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Jewelry Menu</span>
          </button>

          <Link
            href="/shop"
            className="text-xs font-bold text-black uppercase hover:underline flex items-center gap-1"
          >
            <span>All Jewelry</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[135px] bottom-0 bg-white z-50 overflow-y-auto p-5 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              <span>Collections</span>
            </h3>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {navTree.map((item) => {
              const isExpanded = expandedMobileItem === item.id;
              const hasCategories = item.categories && item.categories.length > 0;

              return (
                <div key={item.id || item.slug} className="border-b border-gray-100 pb-2">
                  <div className="flex items-center justify-between py-2">
                    <Link
                      href={`/shop?collection=${item.slug || item.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-bold text-sm text-gray-900 uppercase tracking-wider"
                    >
                      {item.name}
                    </Link>
                    {hasCategories && (
                      <button
                        onClick={() => setExpandedMobileItem(isExpanded ? null : item.id)}
                        className="p-1 text-gray-500"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  {hasCategories && isExpanded && (
                    <div className="pl-3 pt-2 space-y-3 border-l-2 border-gray-200 ml-1">
                      {item.categories.map((cat) => (
                        <div key={cat.id || cat.slug} className="space-y-1">
                          <h5 className="font-serif font-bold text-xs text-gray-900">{cat.name}</h5>
                          {cat.sub_categories && (
                            <ul className="pl-2 space-y-1">
                              {cat.sub_categories.map((sub) => (
                                <li key={sub.id || sub.slug}>
                                  <Link
                                    href={`/shop?subcategory=${sub.slug || sub.id}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-[11px] text-gray-600 hover:text-black block"
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Static Mobile Links */}
            <div className="pt-2 space-y-2 border-t border-gray-100">
              <Link
                href="/custom-jewelry"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-sm text-gray-900 uppercase tracking-wider py-1"
              >
                CUSTOM JEWELRY
              </Link>
              <Link
                href="/about-us"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-sm text-gray-900 uppercase tracking-wider py-1"
              >
                ABOUT US
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}