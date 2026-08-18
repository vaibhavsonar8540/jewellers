"use client";

import React from "react";
import Link from "next/link";
import HeroBanner from "@/components/heroBanner";
import CustomImg from "@/components/CustomImg";

// Assets
import customJewelDesktop from "@/assets/custom-jewelry/custom-jewel-desktop.webp";
import customJewelMobile from "@/assets/custom-jewelry/custom-jewel-mobile.webp";
import ideaToIcon from "@/assets/custom-jewelry/idea-to-icon.webp";
import handcrafted from "@/assets/custom-jewelry/handcrafted.webp";
import cadDesign from "@/assets/custom-jewelry/cad-design.webp";
import stoneSelection from "@/assets/custom-jewelry/stone-selection.webp";
import delivery from "@/assets/custom-jewelry/delivery.webp";
import conclusion from "@/assets/custom-jewelry/conclusion.webp";
import lovedByCustomers from "@/assets/custom-jewelry/loved-by-customers.webp";
import Reviews from "@/components/Reviews";

export default function CustomJewelryPage() {
  const bespokeSteps = [
    {
      number: "1",
      title: "Consultation",
      description:
        "Begin With A Personal Conversation. Your Ideas Inspirations And Story Shape The Foundation Of Every Detail That Follows.",
      image: conclusion,
      imageRight: false,
    },
    {
      number: "2",
      title: "Handcrafted",
      description:
        "Skilled Artisans Bring Your Piece To Life Shaping Each Element With Patience Precision And Care.",
      image: handcrafted,
      imageRight: true,
    },
    {
      number: "3",
      title: "Design and CAD",
      description:
        "Your Vision Is Translated Into Precise CAD Designs Allowing You To Preview And Refine Your Piece Before Creation Begins.",
      image: cadDesign,
      imageRight: false,
    },
    {
      number: "4",
      title: "Stone Selection",
      description:
        "Carefully Sourced Diamonds And Precious Metals Are Chosen For Brilliance Integrity And Lasting Meaning.",
      image: stoneSelection,
      imageRight: true,
    },
    {
      number: "5",
      title: "Delivery",
      description:
        "Your Finished Piece Arrives Beautifully Presented Ready To Be Worn Cherished And Passed On.",
      image: delivery,
      imageRight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-16 sm:pb-24 space-y-12 sm:space-y-20 lg:space-y-24 overflow-x-hidden">
      {/* 1. Responsive Hero Banner */}
      <HeroBanner
        src={customJewelDesktop}
        mobileSrc={customJewelMobile}
        title="Custom Jewelry Studio"
        desc="Bring your dream jewelry piece to life with our master craftsmen."
        contentClass="absolute inset-0 flex flex-col justify-end items-center text-center p-4 sm:p-8 md:p-12 lg:p-16 text-white space-y-2 sm:space-y-3 pb-6 sm:pb-10 md:pb-16 bg-black/25"
        titleClass="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide text-white"
        descClass="text-xs sm:text-base lg:text-lg font-light max-w-2xl text-slate-100 px-2"
      />

      {/* 2. Section: FROM IDEA TO ICON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif tracking-widest text-gray-900 uppercase">
            From Idea to Icon
          </h2>
          <p className="text-xs sm:text-base text-gray-600 font-sans">
            Transform your vision into a refined creation
          </p>
        </div>

        {/* Feature Sketch Image */}
        <div className="overflow-hidden shadow-xs border border-gray-100 rounded-sm">
          <CustomImg
            srcAttr={ideaToIcon}
            altAttr="Custom Jewelry Design Process Sketch"
            className="w-full h-auto object-cover max-h-[350px] sm:max-h-[450px] md:max-h-[550px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
          <Link
            href="/appointment"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#202A4E] hover:bg-[#151b33] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors shadow-xs text-center"
          >
            Book Appointment
          </Link>
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#202A4E] hover:bg-[#151b33] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors shadow-xs text-center"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* 3. Section: YOUR BESPOKE JOURNEY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-8 sm:space-y-14 lg:space-y-16">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif tracking-widest text-gray-900 uppercase">
            Your Bespoke Journey
          </h2>
          <p className="text-xs sm:text-base text-gray-600 font-sans px-2">
            From First Sketch To Forever Every Step Is Crafted With Intention
          </p>
        </div>

        {/* Alternating Journey Steps */}
        <div className="space-y-0 divide-y divide-gray-100 border-t border-b border-gray-100">
          {bespokeSteps.map((step, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 md:gap-12 py-8 sm:py-12 lg:py-14"
            >
              {/* Image Column */}
              <div
                className={`w-full overflow-hidden rounded-sm ${
                  step.imageRight ? "md:order-2" : "md:order-1"
                }`}
              >
                <CustomImg
                  srcAttr={step.image}
                  altAttr={step.title}
                  className="w-full h-64 sm:h-80 md:h-[380px] lg:h-[420px] object-cover"
                />
              </div>

              {/* Text Column */}
              <div
                className={`flex flex-col items-center justify-center text-center px-2 sm:px-6 lg:px-8 space-y-2 ${
                  step.imageRight ? "md:order-1" : "md:order-2"
                }`}
              >
                {/* Step Number Badge */}
                <span className="text-6xl sm:text-8xl lg:text-9xl font-serif text-amber-900/10 font-bold select-none leading-none -mb-4 sm:-mb-8">
                  {step.number}
                </span>
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-serif text-gray-900 font-normal pt-1">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Section: Loved by Customers Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-2">
        <Reviews />
      </section>
    </div>
  );
}
