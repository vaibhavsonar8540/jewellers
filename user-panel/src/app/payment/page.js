"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Banknote,
  QrCode,
  Building2,
  Lock,
  Tag,
  Sparkles,
  Check,
  Copy,
  Package,
  X,
  Smartphone,
} from "lucide-react";
import CustomImg from "@/components/CustomImg";
import {
  selectCartItems,
  selectCartSubtotal,
  clearCart,
  fetchCart,
} from "@/store/slice/cartSlice";
import { selectAuthUser, selectIsAuthenticated } from "@/store/slice/authSlice";
import {
  createRazorpayOrderThunk,
  verifyRazorpayPaymentThunk,
} from "@/store/slice/orderSlice";

// Helper function to load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const cartItems = useSelector(selectCartItems);
  const cartSubtotal = useSelector(selectCartSubtotal);
  const user = useSelector(selectAuthUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("RAZORPAY"); // Default to Razorpay
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Interactive Test Gateway Modal state
  const [testModalData, setTestModalData] = useState(null);
  const [testModalTab, setTestModalTab] = useState("netbanking"); // netbanking, card, upi
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [upiIdInput, setUpiIdInput] = useState("user@upi");
  const [verifyingTestPayment, setVerifyingTestPayment] = useState(false);

  const showToast = (msg, type = "info") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSession = sessionStorage.getItem("checkoutSession");
      if (savedSession) {
        try {
          setCheckoutData(JSON.parse(savedSession));
        } catch (e) {
          console.error("Error reading checkout session:", e);
        }
      }
    }
  }, []);

  const items = checkoutData?.cartItems || cartItems || [];
  const subTotal = checkoutData?.subTotal || cartSubtotal || 0;
  const discountAmount = checkoutData?.discountAmount
    ? Number(checkoutData.discountAmount.toFixed(2))
    : 0;
  const rawTotal = Math.max(0, subTotal - discountAmount);
  const finalTotalAmount = checkoutData?.totalAmount
    ? Number(checkoutData.totalAmount.toFixed(2))
    : rawTotal > 0
    ? Math.max(1, Number(rawTotal.toFixed(2)))
    : 0;

  const shipping = checkoutData?.shippingAddress || {
    full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || "Customer",
    phone: user?.user_metadata?.phone || "9876543210",
    address: "102, Ambika Soc, ABC",
    city: "Babra",
    state: "Gujarat",
    pincode: "394210",
    email: user?.email || "customer@example.com",
  };

  // Helper to complete test payment verification
  const handleSimulatePaymentCompletion = async (orderData) => {
    setVerifyingTestPayment(true);
    try {
      const mockPayId = `pay_test_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
      const verifyRes = await dispatch(
        verifyRazorpayPaymentThunk({
          razorpay_order_id: orderData.razorpay_order_id || `order_test_${Date.now()}`,
          razorpay_payment_id: mockPayId,
          razorpay_signature: "simulated_test_signature",
        })
      ).unwrap();

      dispatch(clearCart());
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("checkoutSession");
      }
      setTestModalData(null);
      showToast("Order placed successfully!", "success");
      router.push(
        `/checkout/success?order_id=${verifyRes?.order_id || orderData.order_id}&order_number=${verifyRes?.order_number || orderData.order_number}`
      );
    } catch (err) {
      showToast(err?.message || "Failed to verify test payment.", "error");
    } finally {
      setVerifyingTestPayment(false);
      setSubmittingPayment(false);
    }
  };

  // Main Handle Place Final Order Function
  const handlePlaceFinalOrder = async () => {
    if (items.length === 0 && !checkoutData) {
      showToast("Your cart is empty. Please add items before checkout.", "error");
      router.push("/cart");
      return;
    }

    setSubmittingPayment(true);

    try {
      // 1. Create order on server via Edge Function / Thunk
      const orderRes = await dispatch(
        createRazorpayOrderThunk({
          shippingAddress: {
            full_name: shipping.full_name || shipping.fullname || "Customer",
            phone: shipping.phone || "9876543210",
            address: shipping.address || "Standard Address",
            city: shipping.city || "City",
            state: shipping.state || shipping.stateName || "State",
            pincode: shipping.pincode || "394210",
            country: "India",
          },
          cartItems: items,
        })
      ).unwrap();

      if (!orderRes || (!orderRes.order_id && !orderRes.razorpay_order_id)) {
        throw new Error("Failed to create order on server.");
      }

      if (selectedMethod === "COD") {
        // Cash On Delivery Flow
        dispatch(clearCart());
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("checkoutSession");
        }
        showToast("Order placed successfully with Cash on Delivery!", "success");
        router.push(
          `/checkout/success?order_id=${orderRes.order_id}&order_number=${orderRes.order_number}`
        );
        return;
      }

      // Automatically open Interactive Test Payment Modal if backend returned a test/simulated order
      if (
        orderRes.is_simulated ||
        !orderRes.razorpay_order_id ||
        orderRes.razorpay_order_id.startsWith("order_test_")
      ) {
        showToast("Opening Interactive Test Gateway...", "info");
        setTestModalData(orderRes);
        setSubmittingPayment(false);
        return;
      }

      // Try Razorpay SDK Popup for live registered API credentials
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        // Fallback to interactive test modal if SDK fails to load
        setTestModalData(orderRes);
        setSubmittingPayment(false);
        return;
      }

      const razorpayKey =
        orderRes.razorpay_key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_TNJiARuSYunrIB";

      const options = {
        key: razorpayKey,
        amount: orderRes.amount || Math.round(finalTotalAmount * 100),
        currency: orderRes.currency || "INR",
        name: "Velora Store",
        description: "Payment for Luxury Jewelry Checkout",
        image: "https://cdn-icons-png.flaticon.com/512/1170/1170576.png",
        prefill: {
          name: shipping.full_name || shipping.fullname || user?.user_metadata?.full_name || "Customer",
          email: shipping.email || user?.email || "customer@example.com",
          contact: shipping.phone || "9876543210",
        },
        theme: {
          color: "#000000",
        },
        handler: async function (response) {
          try {
            showToast("Payment authorized! Finalizing order...", "info");
            const verifyRes = await dispatch(
              verifyRazorpayPaymentThunk({
                razorpay_order_id: response.razorpay_order_id || orderRes.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_test_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || "signature_test",
              })
            ).unwrap();

            if (verifyRes?.success) {
              dispatch(clearCart());
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("checkoutSession");
              }
              showToast("Order placed successfully!", "success");
              router.push(
                `/checkout/success?order_id=${verifyRes.order_id || orderRes.order_id}&order_number=${verifyRes.order_number || orderRes.order_number}`
              );
            } else {
              showToast(verifyRes?.error || "Payment verification failed.", "error");
              setSubmittingPayment(false);
            }
          } catch (error) {
            showToast(error.message || "Failed to verify payment.", "error");
            setSubmittingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            showToast("Payment window closed.", "info");
            setSubmittingPayment(false);
          },
        },
      };

      // Only attach order_id if it's a real server-generated order ID from Razorpay
      if (
        orderRes.razorpay_order_id &&
        !orderRes.razorpay_order_id.startsWith("order_test_")
      ) {
        options.order_id = orderRes.razorpay_order_id;
      }

      let rzpWindow;
      try {
        rzpWindow = new window.Razorpay(options);
        rzpWindow.on("payment.failed", function (response) {
          console.warn("Razorpay SDK payment failed. Opening Interactive Test Modal...", response);
          setTestModalData(orderRes);
          setSubmittingPayment(false);
        });
        rzpWindow.open();
      } catch (sdkErr) {
        console.warn("Razorpay SDK initialization failed, opening test gateway modal:", sdkErr);
        setTestModalData(orderRes);
        setSubmittingPayment(false);
      }
    } catch (err) {
      showToast(err?.message || "Failed to complete order placement.", "error");
      setSubmittingPayment(false);
    }
  };

  const handleCopyTestCard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("4100280000001007");
      setCopiedCard(true);
      showToast("Test Card Number (4100 2800 0000 1007) copied!", "success");
      setTimeout(() => setCopiedCard(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-10 px-3 sm:px-8 lg:px-12 font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 transition-all animate-in slide-in-from-top-4 ${
            toastMessage.type === "error"
              ? "bg-rose-600 text-white"
              : toastMessage.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-slate-900 text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Navigation Header */}
        <div className="flex flex-col gap-3 sm:gap-4 border-b border-gray-200/80 pb-4 sm:pb-6">
          <button
            onClick={() => router.push("/checkout")}
            className="flex items-center gap-2 self-start text-xs sm:text-sm font-semibold text-gray-700 hover:text-black bg-transparent transition cursor-pointer py-1"
          >
            <ArrowLeft size={16} />
            <span>Edit Shipping Address</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight font-serif flex items-center gap-3">
                Select Payment Method
                <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Choose Razorpay for fast, instant & secure online checkout or Pay on Delivery.
              </p>
            </div>

            {/* Test Mode Badge */}
            <div className="self-start sm:self-auto flex items-center gap-2">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-2 border border-red-400/30">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span>TEST MODE ACTIVE</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT SIDE: PAYMENT OPTIONS (Cols 7) */}
          <div className="lg:col-span-7 bg-white border border-gray-200/90 p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm space-y-6">
            {/* Delivery Address Snapshot */}
            <div className="bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 sm:p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <MapPin size={15} className="text-black" />
                <span>DELIVERING TO:</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 capitalize">
                {shipping.full_name || shipping.fullname || "Customer"}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {shipping.address}, {shipping.city}, {shipping.state || shipping.stateName} - {shipping.pincode}
              </p>
              <div className="text-xs text-gray-500 font-mono flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 pt-0.5">
                <span>Phone: {shipping.phone}</span>
                {shipping.email && (
                  <>
                    <span className="hidden sm:inline text-gray-400">|</span>
                    <span className="break-all sm:break-normal">Email: {shipping.email}</span>
                  </>
                )}
              </div>
            </div>

            {/* Razorpay Test Credentials Card */}
            <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-red-50/90 border-2 border-amber-300/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 text-amber-900 font-extrabold text-xs sm:text-sm leading-tight">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
                  <span>Razorpay Sandbox Test Credentials</span>
                </div>
                <span className="bg-amber-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider whitespace-nowrap shrink-0">
                  TEST MODE
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-amber-900/90 leading-relaxed font-medium">
                <strong>Test Credentials:</strong> Use Card <strong>4100 2800 0000 1007</strong> or select <strong>Netbanking</strong> in the popup and click <strong>Success</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                {/* Test Card Number */}
                <div className="bg-white/95 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase block">TEST CARD NUMBER</span>
                    <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm tracking-wider">4100 2800 0000 1007</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTestCard}
                    className="px-2.5 py-1.5 bg-black hover:bg-gray-800 text-white font-bold text-[10px] rounded-lg transition cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    {copiedCard ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Expiry / CVV / OTP */}
                <div className="bg-white/95 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-400 font-extrabold uppercase block">EXPIRY / CVV / OTP</span>
                    <span className="font-mono font-bold text-gray-900 text-xs">12/28 | CVV: 123 | OTP: 123456</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options Header */}
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <CreditCard size={20} className="text-black" />
                Payment Options
              </h2>
            </div>

            {/* Payment Options Radio Cards */}
            <div className="space-y-3.5">
              {/* Option 1: Razorpay Secure Checkout */}
              <div
                onClick={() => setSelectedMethod("RAZORPAY")}
                className={`p-3.5 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === "RAZORPAY"
                    ? "border-black bg-gradient-to-r from-gray-900 to-black text-white shadow-lg scale-[1.01]"
                    : "border-gray-200 bg-white hover:border-gray-400 text-gray-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedMethod === "RAZORPAY"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      <CreditCard size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-extrabold tracking-wide">
                        Razorpay Secure Checkout
                      </h3>
                      <p
                        className={`text-[11px] sm:text-xs mt-0.5 ${
                          selectedMethod === "RAZORPAY" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedMethod === "RAZORPAY"
                          ? "border-white bg-white text-black"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMethod === "RAZORPAY" && <Check size={14} className="sm:w-4 sm:h-4 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 2: Cash on Delivery */}
              <div
                onClick={() => setSelectedMethod("COD")}
                className={`p-3.5 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === "COD"
                    ? "border-black bg-gradient-to-r from-gray-900 to-black text-white shadow-lg scale-[1.01]"
                    : "border-gray-200 bg-white hover:border-gray-400 text-gray-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedMethod === "COD"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      <Banknote size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-extrabold tracking-wide">
                        Cash on Delivery (COD)
                      </h3>
                      <p
                        className={`text-[11px] sm:text-xs mt-0.5 ${
                          selectedMethod === "COD" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Pay with cash or UPI at your doorstep upon receiving order.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedMethod === "COD"
                          ? "border-white bg-white text-black"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMethod === "COD" && <Check size={14} className="sm:w-4 sm:h-4 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 3: UPI / Instant QR Code */}
              <div
                onClick={() => setSelectedMethod("UPI")}
                className={`p-3.5 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === "UPI"
                    ? "border-black bg-gradient-to-r from-gray-900 to-black text-white shadow-lg scale-[1.01]"
                    : "border-gray-200 bg-white hover:border-gray-400 text-gray-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedMethod === "UPI"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-purple-50 text-purple-600 border border-purple-100"
                      }`}
                    >
                      <QrCode size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-extrabold tracking-wide">
                        UPI / Instant QR Code
                      </h3>
                      <p
                        className={`text-[11px] sm:text-xs mt-0.5 ${
                          selectedMethod === "UPI" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        Google Pay, PhonePe, Paytm, BHIM & all UPI apps via Razorpay.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedMethod === "UPI"
                          ? "border-white bg-white text-black"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMethod === "UPI" && <Check size={14} className="sm:w-4 sm:h-4 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Option 4: Net Banking */}
              <div
                onClick={() => setSelectedMethod("NETBANKING")}
                className={`p-3.5 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  selectedMethod === "NETBANKING"
                    ? "border-black bg-gradient-to-r from-gray-900 to-black text-white shadow-lg scale-[1.01]"
                    : "border-gray-200 bg-white hover:border-gray-400 text-gray-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        selectedMethod === "NETBANKING"
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      <Building2 size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-base font-extrabold tracking-wide">
                        Net Banking
                      </h3>
                      <p
                        className={`text-[11px] sm:text-xs mt-0.5 ${
                          selectedMethod === "NETBANKING" ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        SBI, HDFC, ICICI, Axis & 50+ major Indian banks supported.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedMethod === "NETBANKING"
                          ? "border-white bg-white text-black"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedMethod === "NETBANKING" && <Check size={14} className="sm:w-4 sm:h-4 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Purchase Button */}
            <button
              onClick={handlePlaceFinalOrder}
              disabled={submittingPayment}
              className="w-full py-3.5 sm:py-4.5 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl text-xs sm:text-base flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {submittingPayment ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <ShieldCheck size={18} className="sm:w-5 sm:h-5 text-amber-400" />
                  <span>
                    {selectedMethod === "COD"
                      ? "Place Order (Cash on Delivery)"
                      : `Pay ₹${finalTotalAmount} with Razorpay`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY (Cols 5) */}
          <div className="lg:col-span-5 bg-white border border-gray-200/90 p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl shadow-sm space-y-6 lg:sticky lg:top-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-black" />
                Order Items ({items.length})
              </span>
            </h2>

            {/* Product items list */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const title = item.name || item.product_name || "Printed T-Shirt";
                const imgUrl =
                  item.image ||
                  item.thumbnail ||
                  (Array.isArray(item.images) ? item.images[0] : "") ||
                  item.product?.image ||
                  item.product?.thumbnail ||
                  "";
                const price = item.price || 0;
                const qty = item.quantity || 1;

                return (
                  <div
                    key={item.id || item.key || idx}
                    className="flex items-center gap-3.5 bg-gray-50/80 p-3 rounded-2xl border border-gray-200/70"
                  >
                    <div className="w-14 h-16 bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <CustomImg
                        srcAttr={imgUrl}
                        altAttr={title}
                        width={56}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="grow min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate capitalize">
                        {title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Qty: <strong className="text-gray-900">{qty}</strong>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-black">
                        ₹{price * qty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-xs sm:text-sm font-semibold">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">₹{subTotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag size={13} />
                    Coupon Discount ({checkoutData?.appliedCoupon?.code || "DISCOUNT"})
                  </span>
                  <span className="font-extrabold">-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Delivery Charge</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm sm:text-base font-extrabold text-gray-900">
                <span>Total Payable Amount</span>
                <span className="text-xl text-black">₹{finalTotalAmount}</span>
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
              <Lock size={18} className="shrink-0 text-emerald-600" />
              <span>100% Purchase Protection & Free Express Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Test Payment Gateway Modal (Guaranteed Local Sandbox Simulator) */}
      {testModalData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between relative">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-400/30">
                  <ShieldCheck size={12} /> Razorpay Test Gateway
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  Simulate Test Payment
                </h3>
              </div>
              <button
                onClick={() => setTestModalData(null)}
                className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Total Payable Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    Total Amount to Pay
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-sans">
                    ₹{finalTotalAmount}
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <div>Order #: <strong className="text-slate-800">{testModalData.order_number}</strong></div>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="flex border-b border-gray-200 gap-2">
                <button
                  type="button"
                  onClick={() => setTestModalTab("netbanking")}
                  className={`pb-2 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                    testModalTab === "netbanking"
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Net Banking
                </button>
                <button
                  type="button"
                  onClick={() => setTestModalTab("upi")}
                  className={`pb-2 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                    testModalTab === "upi"
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  UPI (GPay/PhonePe)
                </button>
                <button
                  type="button"
                  onClick={() => setTestModalTab("card")}
                  className={`pb-2 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                    testModalTab === "card"
                      ? "border-black text-black"
                      : "border-transparent text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Test Card
                </button>
              </div>

              {/* Tab Panels */}
              {testModalTab === "netbanking" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Select Test Bank:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                          selectedBank === bank
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100"
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {testModalTab === "upi" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Enter VPA / UPI ID:
                  </label>
                  <input
                    type="text"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-black"
                  />
                  <p className="text-[11px] text-gray-500">
                    Supports Google Pay, PhonePe, Paytm or any UPI address.
                  </p>
                </div>
              )}

              {testModalTab === "card" && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase">Card Number</label>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">4100 2800 0000 1007</div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase">Expiry</label>
                      <div className="font-mono font-bold text-slate-900">12/28</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase">CVV</label>
                      <div className="font-mono font-bold text-slate-900">123</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 p-5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTestModalData(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-black cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={verifyingTestPayment}
                onClick={() => handleSimulatePaymentCompletion(testModalData)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                <span>{verifyingTestPayment ? "Verifying..." : "Simulate Payment Success"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
