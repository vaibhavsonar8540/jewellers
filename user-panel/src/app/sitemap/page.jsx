"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Compass, Gem, ShoppingBag, User, Building, Scale, ArrowLeft } from "lucide-react";

export default function SiteMapPage() {
  const siteMapData = [
    {
      title: "Jewellery Collections",
      icon: Gem,
      links: [
        { name: "Rings Collection", href: "/collection/rings" },
        { name: "Necklaces & Pendants", href: "/collection/necklaces" },
        { name: "Earrings Collection", href: "/collection/earrings" },
        { name: "Bracelets & Bangles", href: "/collection/bracelets" },
        { name: "Custom Jewelry Design Studio", href: "/custom-jewelry" },
        { name: "All Fine Jewellery", href: "/collection" },
      ],
    },
    {
      title: "Customer & Shopping Services",
      icon: ShoppingBag,
      links: [
        { name: "My Bag / Cart", href: "/cart" },
        { name: "Express Checkout", href: "/checkout" },
        { name: "My Orders & Order History", href: "/orders" },
        { name: "My Profile Management", href: "/profile" },
        { name: "Book a Private Appointment", href: "/appointment" },
      ],
    },
    {
      title: "About & Support",
      icon: Building,
      links: [
        { name: "About Luxora Jewellers", href: "/about-us" },
        { name: "Contact & Boutique Locations", href: "/contact" },
      ],
    },
    {
      title: "Legal & Store Policies",
      icon: Scale,
      links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms & Conditions", href: "/terms-and-conditions" },
        { name: "Payment and Financing", href: "/payment-and-financing" },
        { name: "Returns & Shipping Policy", href: "/returns-shipping" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-28">
      {/* 1. Full-Width Warm Cream Header Banner */}
      <div className="w-full bg-[#fbf5ee] border-b border-[#f3e9dc] py-10 sm:py-14 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 tracking-tight">
          Site Map
        </h1>
      </div>

      {/* 2. Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-6">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-700 font-medium">Site Map</span>
        </nav>
      </div>

      {/* 3. Main Body Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 font-normal">
            Website Directory
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-sans">
            Explore the complete directory of Luxora Jewellers collections, client services, store locations, and legal policies.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          {siteMapData.map((category, idx) => {
            const IconComp = category.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 border border-gray-200/80 p-6 space-y-4 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  <IconComp className="w-5 h-5 text-[#202A4E]" />
                  <h3 className="text-lg font-serif text-gray-900 font-normal">
                    {category.title}
                  </h3>
                </div>

                <ul className="space-y-2.5 text-sm text-gray-600">
                  {category.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        className="hover:text-[#202A4E] hover:font-medium transition-colors inline-flex items-center gap-1.5 py-0.5"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Back Link */}
        <div className="pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
