"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, Phone, User, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  registerUser,
  clearAuthError,
  clearAuthSuccess,
  selectAuthLoading,
  selectAuthError,
  selectAuthSuccess,
} from "@/store/slice/authSlice";
import { authService } from "@/services/authService";

export default function AuthModal({ isOpen, onClose, initialTab = "login" }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const errorMsg = useSelector(selectAuthError);
  const successMsg = useSelector(selectAuthSuccess);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Form fields state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
    setResetMsg("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
    setResetMsg("");

    const cleanEmail = loginData.email.trim().toLowerCase();
    const cleanPassword = loginData.password;

    if (!cleanEmail || !cleanPassword) {
      return;
    }

    const action = await dispatch(loginUser({ email: cleanEmail, password: cleanPassword }));

    if (loginUser.fulfilled.match(action)) {
      setTimeout(() => {
        onClose();
        dispatch(clearAuthSuccess());
      }, 1200);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    dispatch(clearAuthSuccess());
    setResetMsg("");

    const cleanName = registerData.name.trim();
    const cleanEmail = registerData.email.trim().toLowerCase();
    const cleanPhone = registerData.phone.trim();
    const cleanPassword = registerData.password;

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return;
    }

    const action = await dispatch(
      registerUser({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPassword,
      })
    );

    if (registerUser.fulfilled.match(action)) {
      setTimeout(() => {
        onClose();
        dispatch(clearAuthSuccess());
      }, 1200);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginData.email.trim()) {
      setResetMsg("Please enter your email address above first.");
      return;
    }
    try {
      await authService.resetPassword(loginData.email);
      setResetMsg("Password reset link sent to your email address.");
    } catch (err) {
      setResetMsg(err.message || "Failed to send reset email.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[1000] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Backdrop overlay listener */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative z-10 border border-gray-100 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 font-medium tracking-tight mb-5">
          {activeTab === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold text-center transition-all cursor-pointer ${
              activeTab === "login"
                ? "border-b-2 border-gray-900 text-gray-900 font-bold"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold text-center transition-all cursor-pointer ${
              activeTab === "register"
                ? "border-b-2 border-gray-900 text-gray-900 font-bold"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Register
          </button>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {resetMsg && (
              <p className="text-[11px] font-semibold text-gray-600 italic mt-1">
                {resetMsg}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Logging in...</span>
                </>
              ) : (
                "LOGIN"
              )}
            </button>

            {/* Error / Success Feedback Below Button */}
            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        )}

        {/* TAB 2: REGISTER FORM */}
        {activeTab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Personal Details Subheader */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 pb-1 border-b border-gray-100">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span>Personal Details</span>
            </div>

            {/* Full Name Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Address Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-600 block">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-900 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-900 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-black transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "SIGN UP"
              )}
            </button>

            {/* Error / Success Feedback Below Button */}
            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
