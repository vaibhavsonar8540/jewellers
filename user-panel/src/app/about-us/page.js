import React from "react";

export const metadata = {
  title: "About Us | Luxora Jewellers",
  description: "Learn about our heritage, craft, and passion for fine handmade jewelry.",
};

export default function AboutUsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
        About Us
      </h1>
      <p className="text-gray-600 text-sm max-w-xl mx-auto">
        Discover our heritage, master craftsmanship, and commitment to creating certified fine gold and solitaire jewelry.
      </p>
    </div>
  );
}
