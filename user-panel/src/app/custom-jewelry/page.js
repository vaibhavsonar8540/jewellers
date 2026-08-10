import React from "react";

export const metadata = {
  title: "Custom Jewelry | Luxora Jewellers",
  description: "Bespoke custom jewelry design service tailored to your style.",
};

export default function CustomJewelryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
        Custom Jewelry
      </h1>
      <p className="text-gray-600 text-sm max-w-xl mx-auto">
        Create bespoke fine jewelry pieces crafted specifically to your exact preferences and specifications.
      </p>
    </div>
  );
}
