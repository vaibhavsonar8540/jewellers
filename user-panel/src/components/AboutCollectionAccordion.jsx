"use client";

import React, { useState } from "react";
import CustomImg from "@/components/CustomImg";
import { LinkButton } from "@/components/Buttons";

const AboutCollectionAccordion = ({ img1, img2 }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const collections = [
    {
      id: 1,
      title: "Signature Fine Jewelry",
      subtitle: "Handcrafted Luxury",
      img: img1,
      href: "/collection/jewellery/bracelate",
      btnText: "Explore Collection",
    },
    {
      id: 2,
      title: "Solitaire & Bridal Series",
      subtitle: "Ethical Brilliance",
      img: img2,
      href: "/collection/engagement/diamond-rings",
      btnText: "Discover Series",
    },
  ];

  return (
    <section className="lg:px-10 pb-4 sm:pb-8 lg:pb-24">



      <div className="flex flex-col md:flex-row gap-2 h-[420px] w-full">
        {collections.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveIndex(index)}
              className={`relative overflow-hidden object-cover cursor-pointer group transition-all duration-700 ease-out h-full ${
                isActive
                  ? "w-full md:w-[60%] flex-[0_0_60%]"
                  : "w-full md:w-[40%] flex-[0_0_40%]"
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <CustomImg
                  srcAttr={item.img}
                  altAttr={item.title}
                  titleAttr={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

              {/* Absolute Content (Title & Button) */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12 text-white space-y-3 z-10">

                <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold leading-tight drop-shadow-md">
                  {item.title}
                </h3>

                <div className="pt-2 transition-all duration-500">
                  <LinkButton
                    href={item.href}
                    variant="whiteHover"
                    className=" transition-colors duration-300 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide"
                  >
                    {item.btnText}
                  </LinkButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AboutCollectionAccordion;
