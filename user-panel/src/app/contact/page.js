"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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
          
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-canela font-normal text-gray-900 tracking-tight">
                Contact Information
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-sans leading-relaxed">
                Our customer service team is available 24/7 to assist you every day.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              
              {/* Call Us */}
              <div className="border-b border-gray-100 pb-6 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F7F4EF] flex items-center justify-center text-gray-800 shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-canela font-normal text-gray-900">
                    Call Us
                  </h3>
                  <p className="text-sm text-gray-600 font-sans">
                    +1 (833) 289-3984
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="border-b border-gray-100 pb-6 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F7F4EF] flex items-center justify-center text-gray-800 shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-canela font-normal text-gray-900">
                    Email:
                  </h3>
                  <p className="text-sm text-gray-600 font-sans">
                    contact@dyvijewelers.com
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="border-b border-gray-100 pb-6 flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-[#F7F4EF] flex items-center justify-center text-gray-800 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-canela font-normal text-gray-900">
                    Address:
                  </h3>
                  <p className="text-sm text-gray-600 font-sans leading-relaxed">
                    42 New Hartford Shopping Center, New Hartford,<br />
                    NY 13413
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Send a Message Form */}
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
                <h3 className="text-2xl font-canela font-normal text-gray-900">Message Sent Successfully!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto font-sans">
                  Thank you for reaching out. Our jewelry customer service team will review your inquiry and respond within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
                  }}
                  className="mt-4 px-8 py-3.5 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none cursor-pointer"
                >
                  Send Another Message
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
                      placeholder="First name"
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
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
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

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs text-gray-900 focus:outline-none focus:border-black rounded-none placeholder:text-gray-400"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    MESSAGE
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Type your Message"
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

      </div>

    </div>
  );
}
