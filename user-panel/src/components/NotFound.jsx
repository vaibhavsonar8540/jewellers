"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, ShoppingBag } from "lucide-react";

export default function NotFound({
  title = "Page Not Found",
  subtitle = "The page you are looking for might have been moved, renamed, or is temporarily unavailable.",
}) {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="max-w-3xl w-full mx-auto text-center space-y-8">
        {/* Image Container - Clean, plain white background, no shadows */}
        <div className="relative mx-auto w-full max-w-md sm:max-w-lg flex justify-center items-center">
          <Image
            src="/not-found.webp"
            alt="Page Not Found"
            width={500}
            height={350}
            priority
            className="w-full h-auto max-h-[300px] sm:max-h-[360px] object-contain"
          />
        </div>

        {/* Text Content */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1b233d] font-canela tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-lg mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1b233d] text-white font-medium text-sm hover:bg-[#28345c] transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/collection"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white border border-slate-200 text-[#1b233d] font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <span>Explore Collections</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

