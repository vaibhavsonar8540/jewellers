import React from "react";
import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/heroCarousel";
import LatestArrivalsSection from "@/components/LatestArrivalsSection";
import DiamondShapeSlider from "@/components/DiamondShapeSlider";
import OurSelections from "@/components/OurSelections";
import TrustFeatures from "@/components/TrustFeatures";

// Import Hero Carousel Images from src/assets/hero
import hero2 from "@/assets/hero/hero2.webp";
import hero2Small from "@/assets/hero/hero2-small.webp";
import hero3 from "@/assets/hero/hero-3.webp";
import hero3Small from "@/assets/hero/hero3-small.webp";
import hero4 from "@/assets/hero/hero4.webp";
import hero4Small from "@/assets/hero/hero4-small.webp";

// Import New Arrival Background Asset
import newArrivalBg from "@/assets/new-arrival.webp";

const heroSlides = [
  {
    src: hero2,
    mobileSrc: hero2Small,
    title: "Timeless Elegance & Grace",
    desc: "Handcrafted diamond jewellery designed to celebrate your most cherished moments with unmatched sparkle.",
    href: "/shop",
  },
  {
    src: hero3,
    mobileSrc: hero3Small,
    title: "The Solitaire Heritage",
    desc: "Discover brilliant-cut solitaire diamonds, meticulously selected for extraordinary fire and clarity.",
    href: "/shop",
  },
  {
    src: hero4,
    mobileSrc: hero4Small,
    title: "Royal High Jewellery",
    desc: "Exquisite artisanal craftsmanship meeting contemporary luxury to define your personal signature.",
    href: "/shop",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Carousel Section */}
      <section className="w-full">
        <HeroCarousel slides={heroSlides} autoPlay={true} autoPlayInterval={5000} />
      </section>

      {/* Custom Ring Craftsmanship Section */}
      <section className="px-6 sm:px-12 lg:px-20 mx-auto my-8 sm:my-16 lg:my-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Text & Appointment CTA */}
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-canela text-gray-900 font-normal leading-tight">
              Customize Your Ring Exactly As You Want
            </h2>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              From hand-selecting rare certified diamonds to selecting your preferred precious metals and intricate band settings, our master jewelers craft your unique vision into a forever masterpiece.
            </p>

            <div className="pt-2">
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center bg-[#202A4E] text-white hover:bg-black text-xs sm:text-sm font-semibold tracking-widest uppercase px-8 py-4 rounded-none transition-colors duration-300"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Right Side: Customization Video (Clean without Card Shadow) */}
          <div className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl">
            <video
              src="/videos/customize-ring.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto max-h-[500px] object-contain rounded-2xl"
            />
          </div>

        </div>
      </section>

      {/* New Arrivals Background Banner Section */}
      <section className="relative w-full min-h-[420px] sm:min-h-[520px] flex items-center justify-start overflow-hidden my-8 sm:my-16 px-8 sm:px-16 md:px-24 lg:px-32">
        <Image
          src={newArrivalBg}
          alt="New Arrivals Collection"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
        
        <div className="relative z-10 text-left text-white max-w-xl space-y-4">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-canela font-normal drop-shadow-md">
            New Arrivals
          </h2>
          <p className="text-sm sm:text-base text-gray-200 font-light drop-shadow">
            Discover our latest handcrafted masterpieces.
          </p>
          <div className="pt-4">
            <Link
              href="/collection/jewellery"
              className="inline-flex items-center justify-center bg-white border border-white text-[#202A4E] hover:bg-transparent hover:text-white text-xs sm:text-sm font-semibold tracking-widest uppercase px-8 py-4 rounded-none transition-all duration-300 shadow-xl"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Diamond Shapes 3D Carousel Section */}
      <DiamondShapeSlider />

      {/* Dynamic Latest Product Arrivals Grid */}
      <LatestArrivalsSection collectionName="all" title="Latest Arrivals" limit={8} />

      {/* Our Selections Collection Grid Section */}
      <OurSelections />

      {/* Trust Features & Guarantee Section */}
      <TrustFeatures />
    </main>
  );
}
