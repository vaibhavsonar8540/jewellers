"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CheckCircle2, AlertCircle, ChevronDown, Loader2 } from "lucide-react";

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

// Yup Validation Schema for Appointment Form
const appointmentValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  date: Yup.string()
    .required("Date is required")
    .test("is-not-past", "Appointment date cannot be in the past", function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = value.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    })
    .test("is-not-sunday", "Appointments are closed on Sundays. Please select Monday to Saturday.", function (value) {
      if (!value) return false;
      const [year, month, day] = value.split("-").map(Number);
      const selectedDate = new Date(year, month - 1, day);
      return selectedDate.getDay() !== 0; // 0 = Sunday
    }),
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Email address is required"),
  time: Yup.string().required("Time slot is required"),
  message: Yup.string().trim().max(1000, "Message cannot exceed 1000 characters"),
});

export default function AppointmentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const todayString = new Date().toISOString().split("T")[0];

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      date: "",
      email: "",
      time: "",
      message: "",
    },
    validationSchema: appointmentValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError(null);
      setSuccessMessage("");
      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "appointment",
            ...values,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmitted(true);
          setSuccessMessage(data.message || "Your appointment request has been submitted successfully!");
          resetForm();
        } else {
          setApiError(data.error || "Failed to submit appointment request. Please try again.");
        }
      } catch (err) {
        console.error("Form submission error:", err);
        setApiError("Network error. Please check your connection and try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-24">
      {/* Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-16 py-10 sm:py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Process Steps */}
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

          {/* Right Column: Book Appointment Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-gray-200/80 pb-4">
              <h2 className="text-3xl sm:text-4xl font-canela font-normal text-gray-900 tracking-tight">
                Send a message
              </h2>
            </div>

            {/* API Error Alert Banner */}
            {apiError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans rounded-none flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span>{apiError}</span>
              </div>
            )}

            {submitted ? (
              <div className="py-16 text-center space-y-4 border border-gray-100 p-8 bg-gray-50/50">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-canela font-normal text-gray-900">Appointment Request Submitted!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto font-sans">
                  {successMessage || "Your appointment request has been submitted successfully. Our team will review your preferred date and time and notify you within 24-48 hours."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setApiError(null);
                    setSuccessMessage("");
                  }}
                  className="mt-4 px-8 py-3.5 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none cursor-pointer"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <form onSubmit={formik.handleSubmit} className="space-y-6 pt-2" noValidate>
                
                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      FIRST NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full border ${
                        formik.touched.firstName && formik.errors.firstName
                          ? "border-red-500 bg-red-50/10"
                          : "border-gray-200 bg-gray-50/30 focus:border-gray-400"
                      } px-4 py-3 text-xs text-gray-900 focus:outline-none rounded-none placeholder:text-gray-400`}
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-[11px] text-red-600 mt-1 font-sans">{formik.errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      LAST NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full border ${
                        formik.touched.lastName && formik.errors.lastName
                          ? "border-red-500 bg-red-50/10"
                          : "border-gray-200 bg-gray-50/30 focus:border-gray-400"
                      } px-4 py-3 text-xs text-gray-900 focus:outline-none rounded-none placeholder:text-gray-400`}
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-[11px] text-red-600 mt-1 font-sans">{formik.errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Phone Number & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      PHONE NUMBER <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full border ${
                        formik.touched.phone && formik.errors.phone
                          ? "border-red-500 bg-red-50/10"
                          : "border-gray-200 bg-gray-50/30 focus:border-gray-400"
                      } px-4 py-3 text-xs text-gray-900 focus:outline-none rounded-none placeholder:text-gray-400`}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1 font-sans">{formik.errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      DATE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      min={todayString}
                      value={formik.values.date}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full border ${
                        formik.touched.date && formik.errors.date
                          ? "border-red-500 bg-red-50/10"
                          : "border-gray-200 bg-gray-50/30 focus:border-gray-400"
                      } px-4 py-3 text-xs text-gray-900 focus:outline-none rounded-none placeholder:text-gray-400`}
                    />
                    {formik.touched.date && formik.errors.date && (
                      <p className="text-[11px] text-red-600 mt-1 font-sans">{formik.errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Email Address & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      EMAIL ADDRESS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full border ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-500 bg-red-50/10"
                          : "border-gray-200 bg-gray-50/30 focus:border-gray-400"
                      } px-4 py-3 text-xs text-gray-900 focus:outline-none rounded-none placeholder:text-gray-400`}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-[11px] text-red-600 mt-1 font-sans">{formik.errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      TIME <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="time"
                        value={formik.values.time}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full border ${
                          formik.touched.time && formik.errors.time
                            ? "border-red-500 bg-red-50/10"
                            : "border-gray-200 bg-gray-50/30 focus:border-gray-400"
                        } px-4 py-3 text-xs text-gray-900 focus:outline-none rounded-none appearance-none cursor-pointer pr-10`}
                      >
                        <option value="" disabled>Select Preferred Time</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:30 PM">02:30 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:30 PM">05:30 PM</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {formik.touched.time && formik.errors.time && (
                      <p className="text-[11px] text-red-600 mt-1 font-sans">{formik.errors.time}</p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    MESSAGE / NOTES
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Type your message or special requests..."
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full border ${
                      formik.touched.message && formik.errors.message
                        ? "border-red-500 bg-red-50/10"
                        : "border-gray-200 bg-gray-50/30 focus:border-gray-400"
                    } px-4 py-3 text-xs text-gray-900 focus:outline-none rounded-none placeholder:text-gray-400 resize-y`}
                  ></textarea>
                  {formik.touched.message && formik.errors.message && (
                    <p className="text-[11px] text-red-600 mt-1 font-sans">{formik.errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="bg-[#202A4E] hover:bg-black text-white text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-none transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {formik.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>SENDING...</span>
                      </>
                    ) : (
                      <span>SEND MESSAGE</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Trust Features Bar */}
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
