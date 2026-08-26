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

export default function PaymentClientPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const creatingOrder = useSelector(selectCreatingOrder);
  const verifyingPayment = useSelector(selectVerifyingPayment);
  const serverError = useSelector(selectOrderError);

  const { cartItems, clearCart, user } = useCart();

  const [checkoutSession, setCheckoutSession] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("online"); // 'online' | 'cod'
  const [formError, setFormError] = useState("");
  const [testModalData, setTestModalData] = useState(null);
  const [paymentStatusState, setPaymentStatusState] = useState("idle");
  const [completedOrderDetails, setCompletedOrderDetails] = useState(null);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);

  // Modal payment tab & inputs
  const [paymentTab, setPaymentTab] = useState("card");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [upiId, setUpiId] = useState("success@razorpay");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [selectedWallet, setSelectedWallet] = useState("PhonePe / BHIM");

  // Load checkout session data from Session Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSession = sessionStorage.getItem("checkoutSession");
      if (storedSession) {
        try {
          setCheckoutSession(JSON.parse(storedSession));
        } catch (e) {
          console.error("Failed to parse checkout session data", e);
        }
      } else {
        // Fallback: If direct access without session data and no items, push back to cart
        if (cartItems.length === 0 && !isOrderCompleted) {
          router.push("/cart");
        }
      }
    }
  }, [cartItems, isOrderCompleted, router]);

  const handlePlaceFinalOrder = async (e) => {
    e.preventDefault();
    setFormError("");
    dispatch(clearOrderError());

    if (!user) {
      setFormError("You must be logged in to complete your order.");
      return;
    }

    const sessionItems = checkoutSession?.cartItems || cartItems;
    const shippingAddress = checkoutSession?.shippingAddress;

    if (!shippingAddress) {
      setFormError("Shipping address missing. Please return to Checkout page.");
      return;
    }

    if (sessionItems.length === 0) {
      setFormError("Your bag is empty. Please add items to complete checkout.");
      return;
    }

    try {
      // 1. Dispatch Create Razorpay Order Thunk to backend Edge Function
      const orderResult = await dispatch(
        createRazorpayOrderThunk({
          cartItems: sessionItems,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod,
        })
      ).unwrap();

      if (!orderResult?.success) {
        setFormError(orderResult?.error || "Failed to create order on server.");
        return;
      }

      // Handle Cash on Delivery
      if (paymentMethod === "cod") {
        clearCart();
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("checkoutSession");
        }
        router.push(
          `/checkout/success?order_id=${orderResult.order_id}&order_number=${orderResult.order_number}`
        );
        return;
      }

      // Handle Razorpay Payment Flow (Online Payment)
      const options = {
        key: orderResult.razorpay_key_id,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: "Luxora Jewellers",
        description: `Order ${orderResult.order_number}`,
        order_id: orderResult.razorpay_order_id,
        prefill: {
          name: shippingAddress.full_name,
          contact: shippingAddress.phone,
          email: user?.email || "",
        },
        theme: {
          color: "#1A2238",
        },
        handler: async function (response) {
          try {
            setPaymentStatusState("processing");
            setIsOrderCompleted(true);

            // Verify Payment Signature via Redux Thunk
            const verifyResult = await dispatch(
              verifyRazorpayPaymentThunk({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            ).unwrap();

            if (verifyResult?.success) {
              clearCart();
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("checkoutSession");
              }
              setCompletedOrderDetails({
                order_id: verifyResult.order_id || orderResult.order_id,
                order_number: verifyResult.order_number || orderResult.order_number,
                razorpay_payment_id: response.razorpay_payment_id,
                amount: orderResult.amount / 100,
              });
              setPaymentStatusState("success");
            } else {
              setPaymentStatusState("idle");
              setIsOrderCompleted(false);
              setFormError(verifyResult?.error || "Payment verification failed.");
            }
          } catch (err) {
            setPaymentStatusState("idle");
            setIsOrderCompleted(false);
            setFormError(err || "Payment signature verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout modal dismissed by user.");
          },
        },
      };

      // Check if Razorpay SDK script is loaded in window
      if (typeof window !== "undefined" && window.Razorpay) {
        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        // Fallback to Interactive Test Gateway Modal
        setTestModalData({
          orderResponse: orderResult,
        });
      }
    } catch (err) {
      console.error("Payment execution error:", err);
      setFormError(err || "An error occurred while processing payment. Please try again.");
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
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("checkoutSession");
        }
        setCompletedOrderDetails({
          order_id: verifyResult.order_id || orderResponse.order_id,
          order_number: verifyResult.order_number || orderResponse.order_number,
          razorpay_payment_id: testPaymentId,
          amount: (orderResponse.amount || 0) / 100,
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
      setFormError(err || "Failed to verify test payment signature.");
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

  const currentItems = checkoutSession?.cartItems || cartItems;
  const currentTotal = checkoutSession?.totalAmount || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-24">
      {/* Top Breadcrumb */}
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
          <Link href="/checkout" className="hover:text-black transition-colors">
            Checkout
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-medium">Payment</span>
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 font-normal tracking-wide">
              Select Payment Method
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              Choose your preferred payment gateway to finalize your order
            </p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors border border-slate-200 px-3 py-1.5 rounded-none bg-white shadow-xs w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Address
          </Link>
        </div>

        {/* Global Error Banner */}
        {(formError || serverError) && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-none text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Payment Exception</p>
              <p className="mt-0.5 font-sans">{formError || serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceFinalOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Payment Options */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs font-serif">
                  2
                </div>
                <h2 className="text-lg font-serif text-slate-900 font-normal">Payment Option</h2>
              </div>

              <div className="space-y-4">
                {/* Option 1: Razorpay Online Payment */}
                <label
                  onClick={() => setPaymentMethod("online")}
                  className={`block p-5 border cursor-pointer transition-all ${
                    paymentMethod === "online"
                      ? "border-[#1A2238] bg-slate-50/70 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="mt-1 accent-[#1A2238]"
                      />
                      <div>
                        <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                          <span>Razorpay Online Gateway</span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-mono uppercase font-bold rounded">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
                          Pay securely via Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), NetBanking, or Wallet options.
                        </p>
                      </div>
                    </div>
                    <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                  </div>
                </label>

                {/* Option 2: Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`block p-5 border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-[#1A2238] bg-slate-50/70 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-1 accent-[#1A2238]"
                      />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          Cash on Delivery (COD)
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-sans leading-relaxed">
                          Pay with cash or UPI upon delivery. Insured transit with OTP verification at doorstep.
                        </p>
                      </div>
                    </div>
                    <Package className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                  </div>
                </label>
              </div>

              {/* Shipping Address Summary Card */}
              {checkoutSession?.shippingAddress && (
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block">
                    Deliver To:
                  </span>
                  <div className="p-4 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 leading-relaxed">
                    <p className="font-bold text-slate-900">{checkoutSession.shippingAddress.full_name}</p>
                    <p>{checkoutSession.shippingAddress.address}</p>
                    <p>
                      {checkoutSession.shippingAddress.city}, {checkoutSession.shippingAddress.state} -{" "}
                      {checkoutSession.shippingAddress.pincode}
                    </p>
                    <p className="mt-1 text-slate-500">Phone: {checkoutSession.shippingAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs sticky top-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-lg font-serif text-slate-900 font-normal">Order Summary</h2>
                <span className="text-xs text-slate-500 font-sans">
                  {currentItems.length} {currentItems.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              <div className="space-y-3 pt-2 text-xs font-sans">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{currentTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Insured Express Shipping</span>
                  <span className="font-semibold text-emerald-700">FREE</span>
                </div>
                <div className="w-full h-px bg-slate-200 my-1" />
                <div className="flex justify-between text-base sm:text-lg font-semibold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-black font-semibold">₹{currentTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creatingOrder || verifyingPayment}
                  className="w-full bg-[#1A2238] hover:bg-black text-white font-bold tracking-widest py-4 uppercase text-xs sm:text-sm transition-all duration-200 rounded-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                >
                  {creatingOrder ? (
                    <span>Initiating Payment...</span>
                  ) : verifyingPayment ? (
                    <span>Verifying Signature...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>
                        {paymentMethod === "cod" ? "CONFIRM COD ORDER" : `PAY NOW (₹${currentTotal.toLocaleString("en-IN")})`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center font-sans">
                Transactions protected with 256-bit SSL encryption.
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Razorpay Test Gateway Fallback Modal */}
      {testModalData && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
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

            {/* Modal Body */}
            {paymentStatusState === "processing" ? (
              <div className="p-10 text-center space-y-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">Verifying Payment Signature...</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Updating backend order database and clearing cart session.
                  </p>
                </div>
              </div>
            ) : paymentStatusState === "success" ? (
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
                    Your order has been placed successfully.
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
                    <span className="font-semibold text-black text-sm">
                      ₹{completedOrderDetails?.amount?.toLocaleString("en-IN")}
                    </span>
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
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPaymentTab("card")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "card" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("upi")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "upi" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("netbanking")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "netbanking" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    <span>Banking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("wallet")}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentTab === "wallet" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Wallets</span>
                  </button>
                </div>

                <div className="pt-3 flex gap-3 font-sans border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setTestModalData(null)}
                    className="flex-1 py-3 px-4 text-xs font-semibold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={verifyingPayment}
                    onClick={() => handleConfirmTestPayment(testModalData.orderResponse)}
                    className="flex-2 py-3 px-4 text-xs font-bold bg-[#1A2238] hover:bg-black text-white rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PAY NOW</span>
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
