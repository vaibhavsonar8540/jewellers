import React from 'react';

const HomePage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-2xl p-10 shadow-md">
        <h1 className="text-4xl font-extrabold mb-3">Welcome to Jewellers Storefront</h1>
        <p className="text-amber-100 max-w-xl text-lg">
          Discover hand-crafted fine jewelry, luxury collections, and timeless elegance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Featured Products</h3>
          <p className="text-gray-500 text-sm">Explore our latest handcrafted ring & necklace sets.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Custom Designs</h3>
          <p className="text-gray-500 text-sm">Personalize your jewelry for special occasions.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">Express Delivery</h3>
          <p className="text-gray-500 text-sm">Secure and insured shipping directly to your door.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
