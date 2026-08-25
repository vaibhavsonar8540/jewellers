"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomImg from "@/components/CustomImg";
import { supabase } from "@/lib/db";

const Footer = () => {
  const [collections, setCollections] = useState([]);

  // Fetch active collections from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadCollections = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("collections")
            .select("id, name, slug")
            .order("name", { ascending: true });

          if (!error && data && isMounted) {
            setCollections(data);
          }
        }
      } catch (err) {
        console.error("Footer collections fetch error:", err);
      }
    };
    loadCollections();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fallback default collections if database is loading or empty
  const displayCollections =
    collections.length > 0
      ? collections
      : [
          { id: "1", name: "Rings", slug: "rings" },
          { id: "2", name: "Necklaces", slug: "necklaces" },
          { id: "3", name: "Earrings", slug: "earrings" },
          { id: "4", name: "Bracelets", slug: "bracelets" },
          { id: "5", name: "Bangles", slug: "bangles" },
          { id: "6", name: "Pendants", slug: "pendants" },
        ];

  return (
    <footer className="bg-[#1b233d] text-white relative overflow-hidden pt-14 pb-8 border-t border-white/5">
      
      {/* Decorative Subtle Background Overlay Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* Footer Navigation Columns Grid (2 Columns on small screens, 4 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 max-w-6xl mx-auto mb-14 text-left">
          
          {/* Column 1: Brand Logo & Social Links */}
          <div className="space-y-5 flex flex-col items-start justify-between">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <CustomImg
                srcAttr="/logo.webp"
                altAttr="Website Logo"
                titleAttr="Website Logo"
                width={220}
                height={80}
                className="h-12 sm:h-16 md:h-18 w-auto object-contain brightness-0 invert"
              />
            </Link>
            
            <div className="w-full pt-3.5 border-t border-white/10 space-y-2.5">
              <h4 className="text-xs font-semibold tracking-wider text-gray-300 uppercase">
                Follow Us
              </h4>
              <div className="flex items-center gap-3 text-gray-300 justify-start">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="p-2 rounded-full bg-white/5 hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Dynamic Collections */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase border-b border-white/10 sm:border-none pb-2 sm:pb-0">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300 font-normal">
              {displayCollections.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/collection?collection=${item.id}`}
                    className="hover:text-white transition-colors duration-200 block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Options */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase border-b border-white/10 sm:border-none pb-2 sm:pb-0">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300 font-normal">
              <li>
                <a
                  href="tel:+1234567890"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Call Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@luxura.com"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Email Us
                </a>
              </li>
              <li>
                <Link
                  href="/book-appointment"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Book an Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Information & Policies */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase border-b border-white/10 sm:border-none pb-2 sm:pb-0">
              Information
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300 font-normal">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Site Map
                </Link>
              </li>
              <li>
                <Link
                  href="/payment-and-financing"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Payment and Financing
                </Link>
              </li>
              <li>
                <Link
                  href="/returns-shipping"
                  className="hover:text-white transition-colors duration-200 block py-0.5"
                >
                  Returns & Shipping
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Secondary Links Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 max-w-6xl mx-auto text-center sm:text-left">
          <p className="w-full sm:w-auto text-center sm:text-left">© {new Date().getFullYear()} Luxura.com. All rights reserved.</p>
          <div className="hidden sm:flex items-center gap-6 text-gray-300 text-xs">
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">
              Site Map
            </Link>
            <Link href="/returns-shipping" className="hover:text-white transition-colors">
              Returns & Shipping
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;