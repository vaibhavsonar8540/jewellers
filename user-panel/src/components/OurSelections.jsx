import React from "react";
import Image from "next/image";
import Link from "next/link";

// Import collection selection images
import engagementRingImg from "@/assets/collection/engagement-ring.webp";
import necklaceImg from "@/assets/collection/necklace.webp";
import braceletImg from "@/assets/collection/bracelate.webp";
import earringImg from "@/assets/collection/earring.webp";

const selections = [
  {
    title: "ENGAGEMENT RING",
    image: engagementRingImg,
    href: "/collection/engagement/engagement-rings",
  },
  {
    title: "PENDANTS & NECKLACE",
    image: necklaceImg,
    href: "/collection/jewellery/necklace",
  },
  {
    title: "BRACELET",
    image: braceletImg,
    href: "/collection/jewellery/bracelate",
  },
  {
    title: "EARRINGS",
    image: earringImg,
    href: "/collection/jewellery/earrings",
  },
];

export default function OurSelections() {
  return (
    <section className="px-4 sm:px-12 lg:px-20 mx-auto">
      {/* Section Header */}
      <h2 className="text-2xl sm:text-4xl text-gray-900 font-canela font-normal tracking-wider text-center uppercase mb-8 sm:mb-14">
        OUR SELECTIONS
      </h2>

      {/* Selections Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 lg:gap-10">
        {selections.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="group flex flex-col items-center text-center cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative w-full aspect-[4/5] bg-[#FAF9F6] rounded-sm overflow-hidden shadow-xs group-hover:shadow-md transition-all duration-300">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            </div>

            {/* Label Below Image */}
            <span className="mt-4 sm:mt-5 text-xs sm:text-sm font-semibold tracking-widest text-gray-800 uppercase group-hover:text-[#202A4E] transition-colors duration-200">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
