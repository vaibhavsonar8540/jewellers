"use client";

import React from "react";
import CustomImg from "@/components/CustomImg";
import Link from "next/link";
import { Gem, CalendarCheck, Search, User, ShoppingBag } from "lucide-react";

import NavigationHeader from "@/components/ui/navigationHeader";

const Header = () => {
  return (
    <header className="w-full font-sans sticky top-0 z-50 shadow-xs bg-white">
      {/* 1. Top Announcement Bar */}
      <div className="bg-primary text-white py-2.5 px-4 text-center text-xs md:text-sm font-medium tracking-wide">
        <span>Discover What's New - </span>
        <Link
          href="/shop"
          className="underline font-semibold hover:opacity-90 transition-opacity ml-1"
        >
          Shop now
        </Link>
      </div>

      {/* 2. Main Navigation Header */}
      <div className="bg-white border-b border-gray-100 pt-3">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-between min-h-[70px] sm:min-h-[85px]">
          
          {/* Left Actions */}
          <div className="flex items-center gap-5 sm:gap-7 text-gray-800 z-20">
            <Link
              href="/contact"
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider hover:text-primary transition-colors uppercase"
            >
              <Gem className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-800" />
              <span className="hidden sm:inline">CONTACT US</span>
            </Link>

            <Link
              href="/appointment"
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider hover:text-primary transition-colors uppercase"
            >
              <CalendarCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-800" />
              <span className="hidden sm:inline">BOOK APPOINTMENT</span>
            </Link>
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

          {/* Right Icons */}
          <div className="flex items-center gap-4 sm:gap-6 text-gray-800 z-20">
            <button
              aria-label="Search"
              className="p-1 hover:text-primary transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
            </button>

            <button
              aria-label="Account"
              className="p-1 hover:text-primary transition-colors cursor-pointer"
            >
              <User className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
            </button>

            <button
              aria-label="Cart"
              className="p-1 hover:text-primary transition-colors relative cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8]" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Sub Navigation Bar (Collections -> Categories -> Subcategories Mega Menu) */}
      <NavigationHeader />
    </header>
  );
};

export default Header;