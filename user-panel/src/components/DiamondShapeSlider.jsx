"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import diamond shape images from src/assets/diamond-shapes
import roundImg from "@/assets/diamond-shapes/round.webp";
import princessImg from "@/assets/diamond-shapes/princess.webp";
import ovalImg from "@/assets/diamond-shapes/oval.webp";
import pearImg from "@/assets/diamond-shapes/pear.webp";
import heartImg from "@/assets/diamond-shapes/heart.webp";
import asscherImg from "@/assets/diamond-shapes/asscher.webp";
import radiantImg from "@/assets/diamond-shapes/radient.webp";

const diamondShapes = [
  {
    id: "round",
    name: "Round",
    desc: "Classic brilliance with timeless and versatile charm",
    image: roundImg,
  },
  {
    id: "princess",
    name: "Princess",
    desc: "Modern elegance featuring distinct geometric lines",
    image: princessImg,
  },
  {
    id: "oval",
    name: "Oval",
    desc: "Elongated brilliance for a sleek and flattering silhouette",
    image: ovalImg,
  },
  {
    id: "pear",
    name: "Pear",
    desc: "Teardrop elegance combining marquise & round cuts",
    image: pearImg,
  },
  {
    id: "heart",
    name: "Heart",
    desc: "The ultimate romantic symbol of everlasting devotion",
    image: heartImg,
  },
  {
    id: "asscher",
    name: "Asscher",
    desc: "Sophisticated step-cut with striking vintage depth",
    image: asscherImg,
  },
  {
    id: "radiant",
    name: "Radiant",
    desc: "Vibrant sparkle featuring trimmed square corners",
    image: radiantImg,
  },
];

export default function DiamondShapeSlider({ autoPlay = true, autoPlayInterval = 3500 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + diamondShapes.length) % diamondShapes.length);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % diamondShapes.length);
  };

  // Auto slide interval (pauses when user hovers over the slider)
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isPaused, activeIndex]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Helper to calculate circular distance relative to active index
  const getDiff = (index) => {
    const total = diamondShapes.length;
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const activeShape = diamondShapes[activeIndex];

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full py-10 sm:py-20 bg-white overflow-hidden select-none"
    >
      {/* Faded Background Watermark Text */}
      <div 
        className="hidden sm:block absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 text-5xl sm:text-7xl lg:text-[100px] font-canela font-normal tracking-[0.25em] text-gray-200/40 uppercase pointer-events-none whitespace-nowrap z-0"
        aria-hidden="true"
      >
        DISCOVER SHAPES
      </div>

      <div className="relative z-10 mx-auto px-4 sm:px-12 lg:px-20 pt-2 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Paragraph */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-canela font-normal text-gray-900 tracking-wide uppercase leading-tight">
              DISCOVER SHAPES
            </h2>
            <p className="text-gray-600 text-xs sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0 font-sans">
              Explore our curated selection by diamond shape to find your perfect expression of elegance.
            </p>
          </div>

          {/* Right Column: 3D Diamond Shape Carousel */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            {/* Shapes Graphic Carousel Container */}
            <div 
              className="relative w-full h-44 sm:h-72 flex items-center justify-center overflow-visible"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {diamondShapes.map((shape, index) => {
                const diff = getDiff(index);
                const isCenter = diff === 0;
                const isLeft = diff === -1;
                const isRight = diff === 1;

                // Only render center, immediate left, and immediate right for optimal performance
                if (Math.abs(diff) > 1) return null;

                let transformStyle = "";
                let opacityStyle = "";
                let blurStyle = "";
                let zIndex = 0;

                if (isCenter) {
                  transformStyle = "scale-100 translate-x-0";
                  opacityStyle = "opacity-100";
                  blurStyle = "blur-none";
                  zIndex = 20;
                } else if (isLeft) {
                  transformStyle = "-translate-x-28 sm:-translate-x-48 lg:-translate-x-56 scale-70 sm:scale-75";
                  opacityStyle = "opacity-40 hover:opacity-75";
                  blurStyle = "blur-[2px]";
                  zIndex = 10;
                } else if (isRight) {
                  transformStyle = "translate-x-28 sm:translate-x-48 lg:translate-x-56 scale-70 sm:scale-75";
                  opacityStyle = "opacity-40 hover:opacity-75";
                  blurStyle = "blur-[2px]";
                  zIndex = 10;
                }

                return (
                  <div
                    key={shape.id}
                    onClick={() => {
                      if (isLeft) prevSlide();
                      if (isRight) nextSlide();
                    }}
                    className={`absolute transition-all duration-500 ease-out cursor-pointer flex flex-col items-center justify-center ${transformStyle} ${opacityStyle} ${blurStyle}`}
                    style={{ zIndex }}
                  >
                    <div className="block relative group">
                      <div className={`relative ${isCenter ? 'w-36 h-36 sm:w-56 sm:h-56 lg:w-60 lg:h-60' : 'w-24 h-24 sm:w-44 sm:h-44'} transition-all duration-500 drop-shadow-xl`}>
                        <Image
                          src={shape.image}
                          alt={shape.name}
                          fill
                          sizes="(max-width: 640px) 150px, (max-width: 1024px) 220px, 240px"
                          className="object-cover filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-105"
                          priority={isCenter}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Shape Title & Description Navigation Controls */}
            <div className="mt-3 sm:mt-6 text-center space-y-2 max-w-sm mx-auto">
              <h3 className="text-lg sm:text-2xl font-bold font-sans text-gray-900 tracking-wide">
                {activeShape.name}
              </h3>

              {/* Prev Arrow, Description, Next Arrow */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
                <button
                  onClick={prevSlide}
                  aria-label="Previous shape"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 flex items-center justify-center text-gray-700 transition-all duration-200 cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <p className="text-xs sm:text-sm text-gray-600 font-normal text-center min-h-[36px] flex items-center justify-center font-sans">
                  {activeShape.desc}
                </p>

                <button
                  onClick={nextSlide}
                  aria-label="Next shape"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-900 hover:text-white hover:border-gray-900 flex items-center justify-center text-gray-700 transition-all duration-200 cursor-pointer shrink-0"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
