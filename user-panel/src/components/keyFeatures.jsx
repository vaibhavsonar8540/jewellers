import React from "react";
import { GiBoxUnpacking } from "react-icons/gi";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { ImPriceTags } from "react-icons/im";

const features = [
  {
    id: 1,
    icon: GiBoxUnpacking,
    title: "7 Days Easy Return",
    description: "Hassle-free 7-day return & exchange policy",
  },
  {
    id: 2,
    icon: RiMoneyRupeeCircleFill,
    title: "Cash on Delivery",
    description: "Pay conveniently at your doorstep",
  },
  {
    id: 3,
    icon: ImPriceTags,
    title: "Lowest Price Guaranteed",
    description: "Best prices & deals across top collections",
  },
];

const KeyFeatures = () => {
  return (
    <section className="py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-gray-100 flex flex-col items-center justify-center text-center"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4 text-primary text-2xl sm:text-3xl shrink-0">
                  <IconComponent />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;
