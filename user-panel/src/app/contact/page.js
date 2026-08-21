"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Phone, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Yup Validation Schema for Contact Form
const contactValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Email address is required"),
  phone: Yup.string()
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/, "Please enter a valid phone number")
    .nullable()
    .notRequired(),
  message: Yup.string()
    .trim()
    .min(5, "Message must be at least 5 characters")
    .required("Message is required"),
});

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
    validationSchema: contactValidationSchema,
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
            type: "contact",
            ...values,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSubmitted(true);
          setSuccessMessage(data.message || "Thank you for reaching out. Our team will respond within 24 hours.");
          resetForm();
        } else {
          setApiError(data.error || "Failed to send your message. Please try again.");
        }
      } catch (err) {
        console.error("Contact form error:", err);
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
                    contact@luxorajewelers.com
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
                <h3 className="text-2xl font-canela font-normal text-gray-900">Message Sent Successfully!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto font-sans">
                  {successMessage || "Thank you for reaching out. Our jewelry customer service team will review your inquiry and respond within 24 hours."}
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
                  Send Another Message
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
                      placeholder="First name"
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
                      placeholder="Last name"
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

                {/* Email Address */}
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

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
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

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    MESSAGE <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Type your Message"
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
      </div>
    </div>
  );
}
