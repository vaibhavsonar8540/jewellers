"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomImg from "@/components/CustomImg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gem, CalendarCheck, Search, User, ShoppingBag, X, Loader2, Package, ChevronDown, LogOut, Menu } from "lucide-react";

import NavigationHeader from "@/components/ui/navigationHeader";
import AuthModal from "@/components/ui/AuthModal";
import CartDrawer from "@/components/ui/CartDrawer";
import { fetchActiveProductsService } from "@/lib/productService";
import { supabase } from "@/lib/db";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { openCart, totalItemCount } = useCart();
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);

  // Listen to Supabase Auth State for session changes
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch active products on mount for fast live global search
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetchActiveProductsService();
        if (res?.data && isMounted) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Header search products fetch error:", err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Smooth focus input when search bar opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Handle click outside to close search drawer
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter products by collection, category, subcategory, name, or SKU
  const searchResults = React.useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return [];
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(term);
      const skuMatch = p.sku?.toLowerCase().includes(term);
      const catMatch = p.category_name?.toLowerCase().includes(term);
      const colMatch = p.collection_name?.toLowerCase().includes(term);
      const subMatch = p.sub_category_name?.toLowerCase().includes(term);
      return nameMatch || skuMatch || catMatch || colMatch || subMatch;
    }).slice(0, 8);
  }, [products, searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full font-sans sticky top-0 z-50 shadow-xs bg-white">
      {/* 2. Main Navigation Header */}
      <div className="bg-white border-b border-gray-100 pt-3">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-between min-h-[70px] sm:min-h-[85px]">
          
          {/* Left Actions */}
          <div className="flex items-center gap-5 sm:gap-7 text-gray-800 z-20">
            {/* Desktop View: Contact & Appointment Links (sm screens and above) */}
            <div className="hidden sm:flex items-center gap-5 sm:gap-7">
              <Link
                href="/contact"
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider hover:text-primary transition-colors uppercase"
              >
                <Gem className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-800" />
                <span>CONTACT US</span>
              </Link>

              <Link
                href="/appointment"
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider hover:text-primary transition-colors uppercase"
              >
                <CalendarCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-800" />
                <span>BOOK APPOINTMENT</span>
              </Link>
            </div>

            {/* Mobile View: Jewelry Menu Icon Button (< sm screens) */}
            <div className="sm:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2 text-gray-900 p-1 hover:text-primary transition-colors cursor-pointer"
                aria-label="Toggle Jewelry Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.8]" /> : <Menu className="w-6 h-6 stroke-[1.8]" />}
              </button>
            </div>
          </div>

          {/* Center Brand Logo - Absolutely Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-auto">
            <Link href="/" className="block">
              <CustomImg
                srcAttr="/logo.webp"
                altAttr="Jewellers Brand Logo"
                titleAttr="Jewellers Brand Logo"
                width={220}
                height={60}
                priority={true}
                className="h-10 sm:h-20 md:h-24 w-auto object-contain transition-transform duration-200 hover:scale-102"
              />
            </Link>
          </div>

          {/* Right Icons Section with Smooth Expanding Search Bar to Left */}
          <div className="flex items-center gap-3 sm:gap-5 text-gray-800 z-50 relative" ref={searchContainerRef}>
            
            {/* Smooth Expanding Search Box (Expanding to Left) */}
            <div
              className={`flex items-center transition-all duration-300 ease-out overflow-hidden ${
                searchOpen
                  ? "w-48 sm:w-72 opacity-100 mr-0.5"
                  : "w-0 opacity-0 pointer-events-none"
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search name, collection, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 text-xs font-semibold text-gray-900 px-1 py-1 focus:outline-none focus:border-black transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Search Icon Trigger / Toggle Button */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                if (searchOpen && searchQuery.trim()) {
                  handleSearchSubmit();
                } else {
                  setSearchOpen((prev) => !prev);
                }
              }}
              className="p-1 hover:text-primary transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
            </button>

            <button
              aria-label="Cart"
              onClick={openCart}
              className="p-1 hover:text-primary transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#202A4E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  aria-label="Account Menu"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="p-1 hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer text-gray-900"
                >
                  <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.2] text-gray-600" />
                </button>

                {/* Authenticated User Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-xl z-[999] py-2 animate-in fade-in duration-150">
                    <div className="px-3.5 py-2 border-b border-gray-100 space-y-0.5">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {user.user_metadata?.name || user.user_metadata?.full_name || "Account"}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer border-b border-gray-100"
                    >
                      <User className="w-4 h-4 text-slate-700" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer border-b border-gray-100"
                    >
                      <Package className="w-4 h-4 text-amber-700" />
                      <span>My Orders</span>
                    </Link>

                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        if (supabase) {
                          await supabase.auth.signOut();
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                aria-label="Account"
                onClick={() => setAuthModalOpen(true)}
                className="p-1 hover:text-primary transition-colors cursor-pointer"
              >
                <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
              </button>
            )}

            {/* Live Search Results Dropdown Popover */}
            {searchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl z-[999] p-3.5 max-h-[420px] overflow-y-auto animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Matching Products ({searchResults.length})
                  </span>
                  <button
                    onClick={handleSearchSubmit}
                    className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="py-8 text-center flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-black" />
                    <span className="text-xs text-gray-400 font-medium">Searching products...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 space-y-1">
                    <Package className="w-7 h-7 mx-auto text-gray-300" />
                    <p className="text-xs font-semibold">No matching products found</p>
                    <p className="text-[11px] text-gray-400">Search by collection, category, name, or SKU</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {product.image ? (
                            <CustomImg
                              srcAttr={product.image}
                              altAttr={product.name}
                              width={50}
                              height={50}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-gray-900 truncate group-hover:text-amber-800 transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium pt-0.5">
                            {product.collection_name && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700 uppercase">
                                {product.collection_name}
                              </span>
                            )}
                            {product.category_name && (
                              <span className="truncate">{product.category_name}</span>
                            )}
                            {product.sku && (
                              <span className="font-mono text-gray-400">{product.sku}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs font-bold text-gray-900 shrink-0">
                          ₹{product.price ? product.price.toLocaleString("en-IN") : "0"}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 3. Sub Navigation Bar (Collections -> Categories -> Subcategories Mega Menu) */}
      <NavigationHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* 4. User Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* 5. Shopping Cart Drawer */}
      <CartDrawer />
    </header>
  );
};

export default Header;