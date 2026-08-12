"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LinkButton } from "./Buttons";
import CustomImg from "./CustomImg";
import Link from "next/link";

const HeroCarousel = ({
  slides = [],
  autoPlay = true,
  autoPlayInterval = 4500,
  showDots = false,
  showArrows = false,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides]);

  const prevSlide = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length,
    );
  }, [slides]);

  useEffect(() => {
    if (!autoPlay || isHovered || !slides || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isHovered, nextSlide, slides]);

  // Touch Swipe Handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden select-none group bg-white ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          const desktopSrc = slide.srcAttr || slide.src;
          const mobileSrc = slide.mobileSrc;

          const slideImages = (
            <>
              {/* Desktop Image */}
              {desktopSrc && (
                <CustomImg
                  srcAttr={desktopSrc}
                  altAttr={slide.altAttr || slide.title || "hero slide"}
                  titleAttr={slide.titleAttr || slide.title || "hero slide"}
                  containerClassName={
                    mobileSrc ? "hidden lg:block w-full" : "w-full"
                  }
                  className="w-full h-[450px] sm:h-[600px] lg:h-[750px] object-cover block"
                />
              )}
              {/* Mobile Image */}
              {mobileSrc && (
                <CustomImg
                  srcAttr={mobileSrc}
                  altAttr={slide.altAttr || slide.title || "hero slide"}
                  titleAttr={slide.titleAttr || slide.title || "hero slide"}
                  containerClassName="block lg:hidden w-full"
                  className="w-full h-auto block"
                />
              )}
            </>
          );

          return (
            <div
              key={index}
              className={`w-full transition-opacity duration-700 ease-in-out ${
                index === 0 ? "relative" : "absolute inset-0 h-full"
              } ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {slide.href ? (
                <Link
                  href={slide.href}
                  className="block w-full h-full cursor-pointer"
                >
                  {slideImages}
                </Link>
              ) : (
                slideImages
              )}

              {/* Content Overlay (Rendered only if text/button provided) */}
              {(slide.title || slide.desc || slide.btnText) && (
                <div
                  className={
                    slide.contentClass ||
                    "absolute w-[90%] sm:w-[50%] md:w-[35%] lg:w-[28%] xl:w-[25%] bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto right-auto sm:right-8 md:right-10 lg:right-14 text-center sm:text-left z-20"
                  }
                >
                  {slide.title && (
                    <h1
                      className={
                        slide.titleClass ||
                        "text-white font-canela font-normal text-lg xss:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight drop-shadow-md"
                      }
                    >
                      {slide.title}
                    </h1>
                  )}

                  {slide.desc && (
                    <p
                      className={
                        slide.descClass ||
                        "text-white pt-1.5 sm:pt-3 pb-3 sm:pb-5 text-[11px] xss:text-xs sm:text-sm md:text-base font-medium line-clamp-2 sm:line-clamp-none drop-shadow"
                      }
                    >
                      {slide.desc}
                    </p>
                  )}

                  {slide.btnText && (
                    <LinkButton
                      className={
                        slide.btnClassName ||
                        "font-medium !rounded-none text-xs sm:text-sm !py-2 !px-4 sm:!py-3 sm:!px-6 shadow-md"
                      }
                      href={slide.href || "/collection"}
                      variant={slide.variant || "whiteHover"}
                    >
                      {slide.btnText}
                    </LinkButton>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows (Shown when showArrows is true) */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            suppressHydrationWarning
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 cursor-pointer shadow-lg hover:scale-105"
          >
            <ChevronLeft size={22} className="sm:w-6 sm:h-6" />
          </button>
          <button
            suppressHydrationWarning
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/70 backdrop-blur-sm text-white flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 cursor-pointer shadow-lg hover:scale-105"
          >
            <ChevronRight size={22} className="sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              suppressHydrationWarning
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === currentIndex
                  ? "w-7 h-2 bg-white shadow"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
