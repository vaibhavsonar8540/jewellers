"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronDown } from "lucide-react";

// Trust Feature Icons
import returnIcon from "@/assets/icons/30days-return.svg";
import packingIcon from "@/assets/icons/elegant-packing.svg";
import resizingIcon from "@/assets/icons/free-resizing.svg";
import pricingIcon from "@/assets/icons/competative-pricing.svg";
import shippingIcon from "@/assets/icons/free-shipping.svg";
import warrantyIcon from "@/assets/icons/lifetime-warranty.svg";

const trustFeatures = [
  { id: 1, title: "15 Days Free Return", icon: returnIcon },
  { id: 2, title: "Elegant Packaging", icon: packingIcon },
  { id: 3, title: "Free Resizing", icon: resizingIcon },
  { id: 4, title: "Competitive Pricing", icon: pricingIcon },
  { id: 5, title: "Free Shipping", icon: shippingIcon },
  { id: 6, title: "Lifetime Warranty", icon: warrantyIcon },
];

export default function AppointmentPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    date: "",
    email: "",
    time: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      
      {/* Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 py-10 sm:py-12 lg:py-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Process Steps (Image 3) */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-7 h-7 bg-[#202A4E] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-canela font-normal text-gray-900">
                  Complete the Appointment Form
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed pt-1">
                  Fill out all required details, including your contact information, preferred date, time, and any additional notes.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-7 h-7 bg-[#202A4E] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-canela font-normal text-gray-900">
                  Approval Process
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed pt-1">
                  Once submitted, your request will be reviewed. You will receive a confirmation or update within 24–48 hours.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-7 h-7 bg-[#202A4E] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-canela font-normal text-gray-900">
                  Notification
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed pt-1">
                  After review, you'll receive an email confirming your appointment or informing you of any changes.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Book Appointment Form (Images 4 & 5) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-gray-200/80 pb-4">
              <h2 className="text-3xl sm:text-4xl font-canela font-normal text-gray-900 tracking-tight">
                Send a message
              </h2>
            </div>

            {submitted ? (
              <div className="py-16 text-center space-y-4 border border-gray-100 p-8 bg-gray-50/50">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-canela font-normal text-gray-900">Appointment Request Submitted!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto font-sans">
                  Your appointment request has been submitted successfully. Our team will review your preferred date and time and notify you within 24-48 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ firstName: "", lastName: "", phone: "", date: "", email: "", time: "", message: "" });
                  }}
                  className="mt-4 px-8 py-3.5 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none cursor-pointer"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      FIRST NAME
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      LAST NAME
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Phone Number & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      DATE
                    </label>
                    <input
                      type="text"
                      name="date"
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      required
                      placeholder="Select a date (dd/mm/yyyy)"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Email Address & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      TIME
                    </label>
                    <div className="relative">
                      <select
                        name="time"
                        required
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none appearance-none cursor-pointer pr-10"
                      >
                        <option value="" disabled>Enter Time</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:30 PM">02:30 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:30 PM">05:30 PM</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    MESSAGE
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Type Your Message..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400 resize-y"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#202A4E] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-none transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "SENDING..." : "SEND MESSAGE"}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>

        {/* Trust Features Bar (Image 5) */}
        <div className="mt-20 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-center text-center">
            {trustFeatures.map((feat) => (
              <div key={feat.id} className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src={feat.icon}
                    alt={feat.title}
                    width={48}
                    height={48}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-800 max-w-[120px] leading-snug">
                  {feat.title}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
