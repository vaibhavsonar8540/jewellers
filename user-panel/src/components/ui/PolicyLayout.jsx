"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Minus } from "lucide-react";

export default function PolicyLayout({ title, breadcrumbTitle, introParagraphs = [], sections = [] }) {
  // Keep track of open accordions. By default, open the first section (0).
  const [openSections, setOpenSections] = useState({ 0: true });

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-28">
      {/* 1. Full-Width Warm Cream Header Banner */}
      <div className="w-full bg-[#fbf5ee] border-b border-[#f3e9dc] py-10 sm:py-14 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* 2. Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-6">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-700 font-medium">{breadcrumbTitle || title}</span>
        </nav>
      </div>

      {/* 3. Main Body Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Main Section Header */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 font-normal">
            {title}
          </h2>

          {introParagraphs.map((para, idx) => (
            <p key={idx} className="text-sm sm:text-base text-gray-700 leading-relaxed font-sans">
              {para}
            </p>
          ))}
        </div>

        {/* 4. Collapsible Accordion Sections */}
        <div className="pt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
          {sections.map((sec, index) => {
            const isOpen = !!openSections[index];

            return (
              <div key={index} className="py-4 sm:py-5 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer focus:outline-none"
                >
                  <span className="text-lg sm:text-xl font-serif font-normal text-gray-900 group-hover:text-black transition-colors">
                    {sec.heading}
                  </span>
                  <span className="p-1 rounded-full text-gray-500 group-hover:text-black transition-colors shrink-0">
                    {isOpen ? (
                      <Minus className="w-5 h-5 stroke-[1.5]" />
                    ) : (
                      <Plus className="w-5 h-5 stroke-[1.5]" />
                    )}
                  </span>
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="mt-4 pt-2 text-sm sm:text-base text-gray-700 space-y-4 leading-relaxed font-sans animate-in fade-in duration-200">
                    {sec.content && <p>{sec.content}</p>}

                    {sec.listTitle && (
                      <p className="font-semibold text-gray-900 mt-2">{sec.listTitle}</p>
                    )}

                    {sec.list && sec.list.length > 0 && (
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        {sec.list.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            {typeof item === "string" ? (
                              item
                            ) : (
                              <>
                                <strong>{item.title}:</strong> {item.desc}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sec.extraContent && <p className="pt-2">{sec.extraContent}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
