"use client";

import React, { useState, useEffect } from "react";
import CustomImg from "@/components/CustomImg";
import { Star } from "lucide-react";
import lovedByCustomers from "@/assets/custom-jewelry/loved-by-customers.webp";

const testimonials = [
  {
    id: 1,
    name: "Sophia Reynolds",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    quote:
      "Beautifully made with a timeless sensibility. A piece that feels special, effortless, and enduring.",
    rating: 5,
  },
  {
    id: 2,
    name: "Elena Rostova",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
    quote:
      "The CAD preview made us feel so confident. The final diamond ring exceeded all our expectations.",
    rating: 5,
  },
  {
    id: 3,
    name: "Victoria Vance",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250",
    quote:
      "Luxora transformed my heirloom sketch into a masterwork. Truly unparalleled craftsmanship.",
    rating: 5,
  },
  {
    id: 4,
    name: "Camille Laurent",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250",
    quote:
      "From stone selection to white-glove delivery, every step of our bespoke journey was pure perfection.",
    rating: 5,
  },
];

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = testimonials[activeIndex];

  return (
    <div className="w-full overflow-hidden border border-gray-100 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch min-h-[420px] sm:min-h-[480px]">
        {/* Left Column: Image */}
        <div className="relative w-full h-full min-h-[350px] md:min-h-[480px] flex">
          <CustomImg
            srcAttr={lovedByCustomers}
            altAttr="Loved by Our Customers"
            containerClassName="w-full h-full flex"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Column: Warm Content & Review Carousel */}
        <div className="bg-[#FAF3EB] p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 font-normal tracking-tight">
              Loved by Our Customers
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Our most admired designs. Timeless favorites chosen again and again.
            </p>
          </div>

          {/* Testimonial Active Slide */}
          <div className="space-y-4 max-w-md mx-auto pt-2 animate-in fade-in duration-300">
            {/* Customer Avatar */}
            <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-white shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.avatar}
                alt={current.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Customer Name */}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {current.name}
            </h3>

            {/* Quote */}
            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed px-2">
              &ldquo;{current.quote}&rdquo;
            </p>

            {/* Rating Stars */}
            <div className="flex items-center justify-center gap-1 text-gray-900 pt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
              ))}
            </div>
          </div>

          {/* Carousel Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeIndex
                    ? "w-7 h-2 bg-[#202A4E]"
                    : "w-2 h-2 bg-slate-400/40 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
