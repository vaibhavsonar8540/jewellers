"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  User,
  Building,
  Globe,
  X,
  Smartphone,
  Landmark,
  Wallet,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import CustomImg from "@/components/CustomImg";
import { useCart } from "@/context/CartContext";
import {
  createRazorpayOrderThunk,
  verifyRazorpayPaymentThunk,
  selectCreatingOrder,
  selectVerifyingPayment,
  selectOrderError,
  clearOrderError,
} from "@/store/slice/orderSlice";

export default function CheckoutClientPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const creatingOrder = useSelector(selectCreatingOrder);
  const verifyingPayment = useSelector(selectVerifyingPayment);
  const serverError = useSelector(selectOrderError);

  const { cartItems, subtotal, totalItemCount, user, isCartLoaded, clearCart } = useCart();

  const [formError, setFormError] = useState("");
  const [testModalData, setTestModalData] = useState(null);
  const [paymentStatusState, setPaymentStatusState] = useState("idle"); // 'idle' | 'processing' | 'success'
  const [completedOrderDetails, setCompletedOrderDetails] = useState(null);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  // Payment Options & Inputs
  const [paymentTab, setPaymentTab] = useState("card"); // 'card' | 'upi' | 'netbanking' | 'wallet'
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [upiId, setUpiId] = useState("success@razorpay");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [selectedWallet, setSelectedWallet] = useState("PhonePe / BHIM");

  const [shippingAddress, setShippingAddress] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Pre-fill user details if available
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || prev.full_name,
        phone: user?.user_metadata?.phone || prev.phone,
      }));
    }
  }, [user]);

  // CRITICAL FIX: DO NOT REDIRECT TO CART IF ORDER IS COMPLETED OR IN PROCESS
  useEffect(() => {
    if (
      isCartLoaded &&
      cartItems.length === 0 &&
      !creatingOrder &&
      !verifyingPayment &&
      !testModalData &&
      !isOrderCompleted &&
      paymentStatusState === "idle"
    ) {
      router.push("/cart");
    }
  }, [isCartLoaded, cartItems, creatingOrder, verifyingPayment, testModalData, isOrderCompleted, paymentStatusState, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    dispatch(clearOrderError());
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError("");
    dispatch(clearOrderError());

    // 1. Client-Side Form Validation
    if (!shippingAddress.full_name.trim()) {
      setFormError("Full Name is required.");
      return;
    }
    if (!shippingAddress.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }
    if (!shippingAddress.address.trim()) {
      setFormError("Street Address is required.");
      return;
    }
    if (!shippingAddress.city.trim()) {
      setFormError("City is required.");
      return;
    }
    if (!shippingAddress.state.trim()) {
      setFormError("State is required.");
      return;
    }
    if (!shippingAddress.pincode.trim()) {
      setFormError("Pincode is required.");
      return;
    }

    if (!user) {
      setFormError("For checkout, you need to login first.");
      return;
    }

    try {
      // Save checkout details to session storage for Payment Page
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "checkoutSession",
          JSON.stringify({
            shippingAddress: {
              full_name: shippingAddress.full_name.trim(),
              phone: shippingAddress.phone.trim(),
              address: shippingAddress.address.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              pincode: shippingAddress.pincode.trim(),
              country: shippingAddress.country.trim() || "India",
            },
            cartItems: cartItems,
            subTotal: subtotal,
            totalAmount: grandTotal,
          })
        );
      }

      router.push("/payment");
    } catch (err) {
      console.error("Checkout process error:", err);
      setFormError(err || "Failed to initiate checkout. Please try again.");
    }
  };

  const handleConfirmTestPayment = async (orderResponse) => {
    try {
      setPaymentStatusState("processing");
      setIsOrderCompleted(true);

      const testPaymentId = `pay_test_${Date.now()}`;
      const verifyResult = await dispatch(
        verifyRazorpayPaymentThunk({
          razorpay_order_id: orderResponse.razorpay_order_id,
          razorpay_payment_id: testPaymentId,
          razorpay_signature: "test_signature",
        })
      ).unwrap();

      if (verifyResult?.success) {
        clearCart();
        setCompletedOrderDetails({
          order_id: verifyResult.order_id || orderResponse.order_id,
          order_number: verifyResult.order_number || orderResponse.order_number,
          razorpay_payment_id: testPaymentId,
          amount: grandTotal,
        });
        setPaymentStatusState("success");
      } else {
        setPaymentStatusState("idle");
        setIsOrderCompleted(false);
        setFormError(verifyResult?.error || "Test payment verification failed.");
      }
    } catch (err) {
      setPaymentStatusState("idle");
      setIsOrderCompleted(false);
      setFormError(err || "Failed to verify payment.");
    }
  };

  const handleFinishCheckout = () => {
    if (completedOrderDetails) {
      router.push(
        `/checkout/success?order_id=${completedOrderDetails.order_id}&order_number=${completedOrderDetails.order_number}`
      );
    } else {
      router.push("/orders");
    }
  };

  const shippingCost = 0.00;
  const discountAmount = 0.00;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-24">
      {/* Top Breadcrumb Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/cart" className="hover:text-black transition-colors">
            Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-medium">Checkout</span>
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 font-normal tracking-wide">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              Complete your shipping address to place your luxury jewelry order
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors border border-slate-200 px-3 py-1.5 rounded-none bg-white shadow-xs w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Cart
          </Link>
        </div>

        {/* Global Error Banner */}
        {(formError || serverError) && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-none text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Checkout Exception</p>
              <p className="mt-0.5 font-sans">{formError || serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Shipping Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-serif">
                  1
                </div>
                <h2 className="text-lg font-serif text-slate-900 font-normal">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 mb-1.5 font-sans">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="full_name"
                      value={shippingAddress.full_name}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-sans rounded-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 mb-1.5 font-sans">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-sans rounded-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 mb-1.5 font-sans">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      placeholder="House No, Apartment, Street, Locality"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-sans rounded-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 mb-1.5 font-sans">
                    City *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-sans rounded-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 mb-1.5 font-sans">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-sans rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 mb-1.5 font-sans">
                    Pincode / Postal Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 400001"
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-sans rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-700 mb-1.5 font-sans">
                    Country *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-600 cursor-not-allowed font-sans rounded-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs sticky top-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-lg font-serif text-slate-900 font-normal">Order Summary</h2>
                <span className="text-xs text-slate-500 font-sans">
                  {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-3">
                {cartItems.map((item, idx) => {
                  const combo = item.variation_combo || {};
                  const thumb =
                    item.image ||
                    item.thumbnail ||
                    (Array.isArray(item.images) ? item.images[0] : "") ||
                    item.product?.image ||
                    item.product?.thumbnail ||
                    "";
                  return (
                    <div key={item.id || idx} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 shrink-0 border border-slate-200 overflow-hidden flex items-center justify-center p-1">
                        <CustomImg
                          srcAttr={thumb}
                          altAttr={item.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {combo.color} {combo.purity} {combo.ring_size && `• Size: ${combo.ring_size}`}
                        </p>
                        <p className="text-[11px] text-slate-500 font-sans">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 font-sans">
                        ₹{(parseFloat(item.price || 0) * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
                <div className="w-full h-px bg-slate-200 my-1" />
                <div className="flex justify-between text-base sm:text-lg font-semibold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-black font-semibold font-sans">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creatingOrder || verifyingPayment}
                  className="w-full bg-[#1A2238] hover:bg-black text-white font-bold tracking-widest py-4 uppercase text-xs sm:text-sm transition-all duration-200 rounded-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {creatingOrder ? (
                    <span>Validating & Creating Order...</span>
                  ) : verifyingPayment ? (
                    <span>Verifying Razorpay Signature...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>PROCEED TO PAYMENT (₹{grandTotal.toLocaleString("en-IN")})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-sans">
                By placing your order, you agree to our Terms of Sale and Privacy Policy. Backend Edge Functions handle all verification securely.
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Razorpay Interactive Multi-Method Test Gateway Modal */}
      {testModalData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#1A2238] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Razorpay Payment Gateway</h3>
                  <p className="text-[11px] text-slate-300">Official Test Sandbox Gateway</p>
                </div>
              </div>
              {paymentStatusState === "idle" && (
                <button
                  type="button"
                  onClick={() => setTestModalData(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Order Details Banner */}
            <div className="bg-slate-900 text-slate-100 px-6 py-3 text-xs flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Order:</span>
                <span className="font-mono text-amber-400 font-medium">{testModalData.orderResponse?.order_number}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                <span className="text-slate-400 text-xs font-normal">Amount:</span>
                <span className="text-emerald-400">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Modal Body: State-Driven Views */}
            {paymentStatusState === "processing" ? (
              <div className="p-10 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">Verifying Payment...</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Sending payment signature to Supabase Edge Function (`verify-payment`). Updating database order status and reducing inventory.
                  </p>
                </div>
              </div>
            ) : paymentStatusState === "success" ? (
              /* SUCCESS SCREEN INSIDE MODAL */
              <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-250">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-mono font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Payment Verified</span>
                  </div>
                  <h3 className="text-2xl font-serif text-slate-900 font-bold">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your order has been placed successfully in Supabase. Your cart has been cleared.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-left font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Order Number:</span>
                    <span className="font-bold text-slate-900">{completedOrderDetails?.order_number}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Razorpay Payment ID:</span>
                    <span className="font-bold text-slate-800">{completedOrderDetails?.razorpay_payment_id}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                    <span>Total Amount Paid:</span>
                    <span className="font-semibold text-black text-sm">₹{completedOrderDetails?.amount?.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleFinishCheckout}
                    className="w-full py-4 px-6 bg-[#1A2238] hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>View Full Order Details</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              </div>
            ) : (
              /* PAYMENT METHOD SELECTION FORM */
              <div className="p-6 space-y-5">
                {/* Payment Methods Nav Tabs */}
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPaymentTab("card")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "card" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("upi")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "upi" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("netbanking")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "netbanking" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    <span>Banking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("wallet")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "wallet" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Wallets</span>
                  </button>
                </div>

                {/* Tab Content 1: Cards */}
                {paymentTab === "card" && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Enter Test Card Details</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono">
                        Razorpay Test Card
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4111 1111 1111 1111"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: UPI */}
                {paymentTab === "upi" && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Enter UPI ID / VPA</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                        Auto-Approve
                      </span>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. success@razorpay or 9876543210@paytm"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                      {["success@razorpay", "gpay@upi", "paytm@upi"].map((vpa) => (
                        <button
                          key={vpa}
                          type="button"
                          onClick={() => setUpiId(vpa)}
                          className={`py-1.5 px-2 rounded border text-center font-mono truncate transition-all cursor-pointer ${
                            upiId === vpa ? "border-slate-900 bg-slate-900 text-white font-bold" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {vpa}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Net Banking */}
                {paymentTab === "netbanking" && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <span className="block text-xs font-semibold text-slate-700">Select Popular Indian Bank</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Bank", "Yes Bank"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedBank === bank ? "border-amber-600 bg-amber-50/60 font-bold text-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{bank}</span>
                          {selectedBank === bank && <Check className="w-4 h-4 text-amber-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content 4: Wallets */}
                {paymentTab === "wallet" && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <span className="block text-xs font-semibold text-slate-700">Select Wallet Partner</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {["PhonePe / BHIM", "Mobikwik", "Paytm Wallet", "Freecharge", "Airtel Money", "LazyPay"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWallet(w)}
                          className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedWallet === w ? "border-amber-600 bg-amber-50/60 font-bold text-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{w}</span>
                          {selectedWallet === w && <Check className="w-4 h-4 text-amber-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 flex gap-3 font-sans border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setTestModalData(null)}
                    className="flex-1 py-3 px-4 text-xs font-semibold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={verifyingPayment}
                    onClick={() => handleConfirmTestPayment(testModalData.orderResponse)}
                    className="flex-2 py-3 px-4 text-xs font-bold bg-[#1A2238] hover:bg-black text-white rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    {verifyingPayment ? (
                      <span>Verifying Payment...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>PAY ₹{grandTotal.toLocaleString("en-IN")} NOW</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
