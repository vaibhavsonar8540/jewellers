import React from "react";
import Image from "next/image";

// Import SVG icons from src/assets/icons
import returnIcon from "@/assets/icons/30days-return.svg";
import packingIcon from "@/assets/icons/elegant-packing.svg";
import resizingIcon from "@/assets/icons/free-resizing.svg";
import pricingIcon from "@/assets/icons/competative-pricing.svg";
import shippingIcon from "@/assets/icons/free-shipping.svg";
import warrantyIcon from "@/assets/icons/lifetime-warranty.svg";

const features = [
  {
    id: 1,
    title: "15 Days Free Returns",
    icon: returnIcon,
  },
  {
    id: 2,
    title: "Elegant Packing",
    icon: packingIcon,
  },
  {
    id: 3,
    title: "Free Resizing",
    icon: resizingIcon,
  },
  {
    id: 4,
    title: "Competitive Pricing",
    icon: pricingIcon,
  },
  {
    id: 5,
    title: "Free Shipping",
    icon: shippingIcon,
  },
  {
    id: 6,
    title: "Lifetime Warranty",
    icon: warrantyIcon,
  },
];

export default function TrustFeatures() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-6 sm:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 items-center justify-center">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center justify-center text-center cursor-default"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-3 sm:mb-4">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
              </div>

              {/* Title Text */}
              <h3 className="text-xs sm:text-sm font-medium text-gray-800 tracking-wide">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
