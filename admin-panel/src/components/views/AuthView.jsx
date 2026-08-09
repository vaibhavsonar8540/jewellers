"use client";

import React, { useState } from "react";
import CustomImg from "@/components/CustomImg";
import { useDispatch } from "react-redux";
import { setUser, setSession } from "@/store/slice/authSlice";
import { loginUserAction, registerUserAction } from "@/action/auth.action";
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthView() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const dispatch = useDispatch();

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (isRegister && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // Register flow using signUp
        const res = await registerUserAction({
          email: trimmedEmail,
          password,
          name: name.trim(),
        });

        if (res?.error) {
          setErrorMsg(res.error.message || "Failed to register account.");
        } else if (res?.data?.user) {
          if (res?.data?.session) {
            dispatch(setSession(res.data.session));
            dispatch(setUser(res.data.user));
          } else {
            setSuccessMsg("Account created successfully! Please enter your password to sign in.");
            setIsRegister(false);
            setPassword("");
          }
        } else {
          setErrorMsg("Registration failed. Please try again.");
        }
      } else {
        // Login flow using signInWithPassword
        const res = await loginUserAction({
          email: trimmedEmail,
          password,
        });

        if (res?.error) {
          setErrorMsg(res.error.message || "Invalid email or password.");
        } else if (res?.data?.user) {
          if (res?.data?.session) {
            dispatch(setSession(res.data.session));
          }
          dispatch(setUser(res.data.user));
        } else {
          setErrorMsg("Sign in failed. Please check your credentials.");
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 sm:p-10 flex flex-col items-center space-y-6">
        {/* Top Logo */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <CustomImg
            srcAttr="/logo.webp"
            altAttr="Velora Fine Jewelry Logo"
            titleAttr="Velora Fine Jewelry Logo"
            width={200}
            height={60}
            className="h-14 w-auto object-contain"
          />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mt-2">
            {isRegister ? "Create Admin Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-gray-500 text-center">
            {isRegister
              ? "Enter your details to register as an administrator"
              : "Sign in to access your jewelry management portal"}
          </p>
        </div>

        {/* Feedback Alert Messages */}
        {errorMsg && (
          <div className="w-full p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="w-full p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-emerald-600 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isRegister}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#202A4E]/20 focus:border-[#202A4E] transition-all bg-gray-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="admin@velora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#202A4E]/20 focus:border-[#202A4E] transition-all bg-gray-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#202A4E]/20 focus:border-[#202A4E] transition-all bg-gray-50/50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#202A4E] text-white font-semibold text-sm hover:bg-[#18203d] active:scale-98 transition-all shadow-md disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading
              ? isRegister
                ? "Creating Account..."
                : "Signing In..."
              : isRegister
              ? "Register Account"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-600">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={handleToggleMode}
              className="font-bold text-[#202A4E] hover:underline ml-1 cursor-pointer"
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
