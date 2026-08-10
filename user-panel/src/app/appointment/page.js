"use client";

import React, { useState } from "react";
import { CalendarCheck, Clock, Sparkles, CheckCircle2, User } from "lucide-react";

export default function AppointmentPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Custom Jewelry Design",
    date: "",
    timeSlot: "Morning (10:00 AM - 1:00 PM)",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 md:py-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Private Consultation
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900">
            Book an Appointment
          </h1>
          <p className="text-gray-600 text-sm max-w-lg mx-auto">
            Schedule a personal consultation with our master jewelers for custom designs, solitaire selections, or bridal appointments.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-6 sm:p-10">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Appointment Request Received!</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Thank you for scheduling with Luxora Jewellers. Our team will contact you shortly to confirm your consultation details.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    service: "Custom Jewelry Design",
                    date: "",
                    timeSlot: "Morning (10:00 AM - 1:00 PM)",
                    notes: "",
                  });
                }}
                className="mt-4 px-6 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-900 transition-all cursor-pointer"
              >
                Book Another Appointment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-50/30"
                  />
                </div>
              </div>

              {/* Phone & Service Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Consultation Type
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-50/30 cursor-pointer"
                  >
                    <option value="Custom Jewelry Design">Custom Jewelry Design</option>
                    <option value="Bridal & Engagement">Bridal & Engagement Consultation</option>
                    <option value="Solitaire Diamond Viewing">Solitaire Diamond Viewing</option>
                    <option value="Jewelry Care & Restoration">Jewelry Care & Restoration</option>
                  </select>
                </div>
              </div>

              {/* Preferred Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-50/30 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Preferred Time Slot
                  </label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-50/30 cursor-pointer"
                  >
                    <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 4:00 PM)">Afternoon (1:00 PM - 4:00 PM)</option>
                    <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Special Notes / Specific Design Ideas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                  Special Notes / Specific Ideas
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Tell us about metal preferences, diamond shapes, or specific design ideas..."
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-gray-50/30 resize-y"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-black hover:bg-gray-900 text-white font-semibold text-sm tracking-wider uppercase transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{loading ? "Scheduling..." : "Request Appointment"}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
