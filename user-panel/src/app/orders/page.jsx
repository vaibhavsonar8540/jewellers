"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingBag,
  ChevronRight,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  MapPin,
  Search,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
  X,
  CreditCard,
  User,
  ExternalLink,
  ShieldCheck,
  Pencil,
  RefreshCw,
  Eye,
  Store,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import CustomImg from "@/components/CustomImg";
import {
  fetchOrderHistoryThunk,
  cancelOrderThunk,
  returnOrderThunk,
  updateOrderStatusThunk,
  selectAllOrders,
  selectOrderLoading,
  selectCancellingOrderId,
  selectReturningOrderId,
  selectOrderError,
  selectOrderSuccess,
  clearOrderError,
  clearOrderSuccess,
  setCurrentOrder,
  selectCurrentOrder,
} from "@/store/slice/orderSlice";
import { selectAuthUser, selectIsAuthenticated, setUser } from "@/store/slice/authSlice";
import { supabase } from "@/lib/db";

// Status Badge Styling Helper
const getStatusBadge = (status) => {
  switch (status) {
    case "Confirmed":
      return {
        label: "Confirmed",
        icon: CheckCircle2,
        bg: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
        dot: "bg-emerald-500",
      };
    case "Processing":
      return {
        label: "Processing",
        icon: Clock,
        bg: "bg-amber-50 text-amber-900 border-amber-200/80",
        dot: "bg-amber-500",
      };
    case "Shipped":
      return {
        label: "Shipped",
        icon: Truck,
        bg: "bg-sky-50 text-sky-900 border-sky-200/80",
        dot: "bg-sky-500",
      };
    case "Delivered":
      return {
        label: "Delivered",
        icon: CheckCircle2,
        bg: "bg-emerald-50 text-emerald-900 border-emerald-200/80",
        dot: "bg-emerald-500",
      };
    case "Return Requested":
      return {
        label: "Return Requested",
        icon: RotateCcw,
        bg: "bg-purple-50 text-purple-900 border-purple-200/80",
        dot: "bg-purple-500",
      };
    case "Returned":
      return {
        label: "Returned",
        icon: RotateCcw,
        bg: "bg-gray-100 text-gray-800 border-gray-300",
        dot: "bg-gray-500",
      };
    case "Cancelled":
      return {
        label: "Cancelled",
        icon: XCircle,
        bg: "bg-rose-50 text-rose-900 border-rose-200/80",
        dot: "bg-rose-500",
      };
    default:
      return {
        label: status || "Pending",
        icon: Clock,
        bg: "bg-gray-50 text-gray-800 border-gray-200",
        dot: "bg-gray-400",
      };
  }
};

const getPaymentBadge = (status) => {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "Failed":
      return "bg-rose-100 text-rose-800 border-rose-300";
    default:
      return "bg-amber-100 text-amber-800 border-amber-300";
  }
};

export default function OrdersPage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  const orders = useSelector(selectAllOrders);
  const loading = useSelector(selectOrderLoading);
  const cancellingOrderId = useSelector(selectCancellingOrderId);
  const returningOrderId = useSelector(selectReturningOrderId);
  const error = useSelector(selectOrderError);
  const successMessage = useSelector(selectOrderSuccess);
  const activeDetailOrder = useSelector(selectCurrentOrder);

  const isSeller = user?.role === "seller" || user?.role === "admin" || user?.user_metadata?.role === "seller";

  // Local Filter & UI state
  const [viewRoleTab, setViewRoleTab] = useState(isSeller ? "seller" : "buyer");
  const [activeTab, setActiveTab] = useState("purchased");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Status Edit Modal State for Seller/Admin
  const [editStatusModalOrder, setEditStatusModalOrder] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState("Processing");
  const [sessionChecking, setSessionChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuthAndFetchOrders = async () => {
      setSessionChecking(true);

      let authed = isAuthenticated;
      let activeUser = user;

      if (supabase) {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const currentSessionUser = sessionData?.session?.user;

          if (currentSessionUser) {
            authed = true;
            activeUser = currentSessionUser;
            dispatch(setUser({ user: currentSessionUser, profile: null }));
          }
        } catch (e) {
          console.warn("Session check error:", e);
        }
      }

      if (authed || activeUser) {
        try {
          await dispatch(fetchOrderHistoryThunk()).unwrap();
        } catch (e) {
          // ignore
        }
      }

      if (isMounted) {
        setSessionChecking(false);
      }
    };

    initializeAuthAndFetchOrders();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchOrderHistoryThunk());
  };

  const handleCopyOrderNumber = (orderNumber) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderNumber);
      setCopiedId(orderNumber);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExecuteAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "cancel") {
      dispatch(cancelOrderThunk(confirmAction.orderId));
    } else if (confirmAction.type === "return") {
      dispatch(returnOrderThunk(confirmAction.orderId));
    }
    setConfirmAction(null);
  };

  const handleSaveOrderStatus = async () => {
    if (!editStatusModalOrder) return;
    setUpdatingStatus(true);
    try {
      await dispatch(
        updateOrderStatusThunk({
          orderId: editStatusModalOrder.id,
          newStatus: selectedNewStatus,
        })
      ).unwrap();
      setEditStatusModalOrder(null);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];

    return orders.filter((order) => {
      const isPaid =
        order.payment_status?.toLowerCase() === "paid" ||
        ["Confirmed", "Processing", "Shipped", "Delivered"].includes(order.order_status);

      let matchesTab = true;
      if (activeTab === "purchased") {
        matchesTab = isPaid;
      } else if (activeTab === "pending") {
        matchesTab = !isPaid && order.order_status === "Pending";
      } else if (activeTab === "completed") {
        matchesTab = order.order_status === "Delivered";
      } else if (activeTab === "cancelled_returns") {
        matchesTab = ["Cancelled", "Return Requested", "Returned"].includes(order.order_status);
      } else if (activeTab === "all") {
        matchesTab = true;
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const numMatch = order.order_number?.toLowerCase().includes(query);
        const rzpOrderMatch = order.razorpay_order_id?.toLowerCase().includes(query);
        const itemMatch = order.items?.some((item) =>
          item.product_name?.toLowerCase().includes(query)
        );
        const nameMatch = order.shipping_address?.full_name?.toLowerCase().includes(query);
        matchesSearch = numMatch || rzpOrderMatch || itemMatch || nameMatch;
      }

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 font-sans pb-24">
      {/* Top Breadcrumb Navigation */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-gray-800 font-medium">Orders Management</span>
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pt-2">
        {/* Luxury Header Banner */}
        <div className="bg-gradient-to-r from-[#1A2238] via-[#202A4E] to-[#1A2238] text-white p-8 sm:p-10 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-widest rounded-full">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Order History & Razorpay Receipts</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-white">
                Orders Dashboard
              </h1>
              <p className="text-sm text-slate-300 font-sans max-w-xl">
                Track order status, manage delivery details, view Razorpay payment IDs, and update order lifecycles.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Orders</span>
              </button>

              {isAuthenticated && (
                <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 text-right shrink-0">
                  <div className="text-[10px] text-slate-300 font-mono">Logged in as</div>
                  <div className="text-xs font-semibold text-white truncate max-w-[200px]">
                    {user?.email}
                  </div>
                  <div className="text-xs text-amber-300 font-semibold mt-0.5">
                    Total Orders: {orders.length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seller vs Buyer View Selector (If Seller/Admin) */}
        {isSeller && (
          <div className="flex items-center gap-2 mb-6 bg-white p-2 border border-slate-200 shadow-xs max-w-md">
            <button
              onClick={() => setViewRoleTab("seller")}
              className={`flex-1 py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                viewRoleTab === "seller"
                  ? "bg-[#202A4E] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Store size={15} />
              <span>Customer Orders Received</span>
            </button>
            <button
              onClick={() => setViewRoleTab("buyer")}
              className={`flex-1 py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 ${
                viewRoleTab === "buyer"
                  ? "bg-[#202A4E] text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ShoppingBag size={15} />
              <span>My Purchases</span>
            </button>
          </div>
        )}

        {/* Global Error & Success Banners */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-none text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => dispatch(clearOrderError())}
              className="text-rose-700 hover:text-rose-950 underline text-xs font-bold shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-none text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => dispatch(clearOrderSuccess())}
              className="text-emerald-700 hover:text-emerald-950 underline text-xs font-bold shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading / Guest / Non-authenticated View */}
        {sessionChecking ? (
          <div className="bg-white border border-slate-200/80 p-16 text-center max-w-xl mx-auto shadow-sm space-y-4 my-12">
            <RefreshCw className="w-8 h-8 text-[#202A4E] animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest font-sans text-slate-500 font-semibold">
              Verifying account & loading your orders...
            </p>
          </div>
        ) : !isAuthenticated && !user ? (
          <div className="bg-white border border-slate-200/80 p-12 text-center max-w-xl mx-auto shadow-md space-y-6 my-12">
            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-[#202A4E]">
              <User className="w-10 h-10 stroke-[1.4]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-normal text-slate-900">
                Please Sign In to View Orders
              </h2>
              <p className="text-sm text-slate-500 font-sans leading-relaxed">
                Log in with your registered account to view active orders, tracking updates, and return options.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none"
            >
              Sign In to Account
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Bar & Search */}
            <div className="bg-white border border-slate-200/80 p-4 sm:p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {[
                  {
                    id: "purchased",
                    label: `Purchased Orders (${orders.filter((o) => o.payment_status?.toLowerCase() === "paid" || ["Confirmed", "Processing", "Shipped", "Delivered"].includes(o.order_status)).length})`,
                  },
                  {
                    id: "all",
                    label: `All History (${orders.length})`,
                  },
                  {
                    id: "pending",
                    label: `Unpaid Drafts (${orders.filter((o) => o.payment_status?.toLowerCase() !== "paid" && ["Pending"].includes(o.order_status)).length})`,
                  },
                  {
                    id: "completed",
                    label: `Delivered (${orders.filter((o) => o.order_status === "Delivered").length})`,
                  },
                  {
                    id: "cancelled_returns",
                    label: `Cancelled & Returns (${orders.filter((o) => ["Cancelled", "Return Requested", "Returned"].includes(o.order_status)).length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all rounded-none cursor-pointer border ${
                      activeTab === tab.id
                        ? "bg-[#202A4E] text-white border-[#202A4E]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order # or Product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#202A4E] focus:bg-white rounded-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Orders Loading Skeleton */}
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="bg-white border border-slate-200 p-6 shadow-sm space-y-4 animate-pulse"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div className="h-5 bg-slate-200 w-48 rounded" />
                      <div className="h-6 bg-slate-200 w-24 rounded-full" />
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-slate-200 rounded shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-slate-200 w-2/3 rounded" />
                        <div className="h-4 bg-slate-200 w-1/3 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              /* Empty Orders State */
              <div className="bg-white border border-slate-200/80 p-16 text-center max-w-lg mx-auto shadow-sm space-y-5 my-8">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
                  <ShoppingBag className="w-8 h-8 stroke-[1.4]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-2xl font-serif font-normal text-slate-900">
                    No Orders Found
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {searchQuery
                      ? `No orders matching "${searchQuery}" in this category.`
                      : "You haven't placed any orders yet. Discover our fine jewellery collections."}
                  </p>
                </div>
                <Link
                  href="/collection/jewellery"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-none"
                >
                  <ArrowLeft className="w-4 h-4" /> Explore Shop
                </Link>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-6">
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.order_status);
                  const BadgeIcon = badge.icon;
                  const isCancelling = cancellingOrderId === order.id;
                  const isReturning = returningOrderId === order.id;

                  const canCancel =
                    ["Pending", "Confirmed", "Processing", "Shipped"].includes(order.order_status);
                  const canReturn = order.order_status === "Delivered";

                  const formattedDate = order.created_at
                    ? new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200/80 shadow-md hover:shadow-lg transition-shadow duration-300 relative group"
                    >
                      {/* Card Header Bar */}
                      <div className="bg-slate-50/80 border-b border-slate-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                        {/* Left: Order Number & Date */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs text-slate-500 font-mono">Order #</span>
                          <span className="font-mono text-sm font-bold text-slate-900 tracking-wider">
                            {order.order_number}
                          </span>
                          <button
                            onClick={() => handleCopyOrderNumber(order.order_number)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                            title="Copy Order Number"
                          >
                            {copiedId === order.order_number ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="text-slate-300 font-light">|</span>
                          <span className="text-xs text-slate-500 font-sans">
                            Placed on {formattedDate}
                          </span>
                        </div>

                        {/* Right: Payment Method & Status Badge */}
                        <div className="flex items-center gap-3">
                          {/* Payment status badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold border rounded-none ${getPaymentBadge(
                              order.payment_status
                            )}`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Payment: {order.payment_status || "Pending"}</span>
                          </span>

                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-none ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <BadgeIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>{badge.label}</span>
                          </div>

                          {/* Seller Status Edit Action Button */}
                          {isSeller && (
                            <button
                              onClick={() => {
                                setEditStatusModalOrder(order);
                                setSelectedNewStatus(order.order_status || "Processing");
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-none transition cursor-pointer"
                              title="Update Order Status (Seller)"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Body: Items Snapshot */}
                      <div className="p-6 divide-y divide-slate-100">
                        {order.items &&
                          order.items.map((item, idx) => {
                            const variation = item.variation || item;
                            const variantSpecs = [
                              variation.color ? `Color: ${variation.color}` : null,
                              variation.purity ? `Purity: ${variation.purity}` : null,
                              variation.ring_size || variation.ringSize
                                ? `Size: ${variation.ring_size || variation.ringSize}`
                                : null,
                            ].filter(Boolean);

                            return (
                              <div
                                key={idx}
                                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  {/* Product Thumbnail */}
                                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                    <CustomImg
                                      srcAttr={item.thumbnail}
                                      altAttr={item.product_name}
                                      width={64}
                                      height={64}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>

                                  {/* Product Specs */}
                                  <div className="space-y-1">
                                    <h4 className="text-base font-serif font-normal text-slate-900">
                                      {item.product_name}
                                    </h4>
                                    {variantSpecs.length > 0 && (
                                      <p className="text-xs text-slate-500 font-mono">
                                        {variantSpecs.join(" | ")}
                                      </p>
                                    )}
                                    <p className="text-xs text-slate-600 font-mono">
                                      Quantity: <strong className="text-slate-900">{item.quantity}</strong>
                                    </p>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="text-right shrink-0">
                                  <div className="text-sm font-semibold text-slate-900 font-sans">
                                    ₹{(parseFloat(item.price) * item.quantity).toLocaleString("en-IN")}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono">
                                    ₹{parseFloat(item.price).toLocaleString("en-IN")} each
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Card Footer: Summary & Action Buttons */}
                      <div className="bg-slate-50/50 border-t border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Total Amount & Razorpay IDs preview */}
                        <div className="space-y-0.5">
                          <div className="text-xs text-slate-500 font-sans">Total Amount</div>
                          <div className="text-xl font-bold text-slate-900 font-sans flex items-center gap-2">
                            <span>₹{parseFloat(order.total_amount || 0).toLocaleString("en-IN")}</span>
                          </div>
                          {order.razorpay_order_id && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              Razorpay Order: {order.razorpay_order_id}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                          {canCancel && (
                            <button
                              disabled={isCancelling}
                              onClick={() =>
                                setConfirmAction({
                                  type: "cancel",
                                  orderId: order.id,
                                  orderNumber: order.order_number,
                                })
                              }
                              className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-50"
                            >
                              {isCancelling ? "Cancelling..." : "Cancel Order"}
                            </button>
                          )}

                          {canReturn && (
                            <button
                              disabled={isReturning}
                              onClick={() =>
                                setConfirmAction({
                                  type: "return",
                                  orderId: order.id,
                                  orderNumber: order.order_number,
                                })
                              }
                              className="px-4 py-2 border border-purple-300 text-purple-800 hover:bg-purple-50 text-xs font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-50"
                            >
                              {isReturning ? "Submitting..." : "Request Return"}
                            </button>
                          )}

                          <button
                            onClick={() => dispatch(setCurrentOrder(order))}
                            className="px-5 py-2 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Info</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Modal (Seller / Admin) */}
      {editStatusModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-semibold text-slate-900 flex items-center gap-2">
                <Pencil size={18} className="text-amber-600" />
                Update Order Status
              </h3>
              <button
                onClick={() => setEditStatusModalOrder(null)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <p className="text-xs text-slate-600">
                Order #: <strong className="font-mono text-slate-900">{editStatusModalOrder.order_number}</strong>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select New Order Status:
                </label>
                <select
                  value={selectedNewStatus}
                  onChange={(e) => setSelectedNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 p-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#202A4E]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered (Marks Paid)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditStatusModalOrder(null)}
                className="px-4 py-2 border border-slate-300 hover:border-black text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleSaveOrderStatus}
                className="px-6 py-2 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {updatingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-serif font-normal text-slate-900">
                Confirm {confirmAction.type === "cancel" ? "Order Cancellation" : "Return Request"}
              </h3>
              <button
                onClick={() => setConfirmAction(null)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              {confirmAction.type === "cancel" ? (
                <>
                  Are you sure you want to cancel order{" "}
                  <strong className="text-slate-900 font-mono">{confirmAction.orderNumber}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to submit a return request for order{" "}
                  <strong className="text-slate-900 font-mono">{confirmAction.orderNumber}</strong>?
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border border-slate-300 hover:border-black text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-6 py-2 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  confirmAction.type === "cancel"
                    ? "bg-rose-700 hover:bg-rose-800"
                    : "bg-purple-800 hover:bg-purple-900"
                }`}
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Slide-Over Drawer */}
      {activeDetailOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="bg-[#1A2238] text-white p-6 flex items-center justify-between sticky top-0 z-10">
              <div className="space-y-1">
                <div className="text-xs text-amber-300 font-mono uppercase tracking-widest">
                  Order Info & Customer Details
                </div>
                <h3 className="text-xl font-serif font-normal">
                  {activeDetailOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => dispatch(setCurrentOrder(null))}
                className="p-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-8 flex-1">
              <div className="bg-slate-50 border border-slate-200 p-5 space-y-3">
                <div className="text-xs text-slate-500 font-mono uppercase">Current Order & Payment Status</div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold border ${
                      getStatusBadge(activeDetailOrder.order_status).bg
                    }`}
                  >
                    <span>Status: {activeDetailOrder.order_status}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border font-mono ${getPaymentBadge(
                      activeDetailOrder.payment_status
                    )}`}
                  >
                    <span>Payment: {activeDetailOrder.payment_status || "Pending"}</span>
                  </span>
                </div>
              </div>

              {/* Shipping Address & Customer Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Delivery & Customer Details
                </h4>
                <div className="bg-slate-50/80 border border-slate-200 p-5 text-xs sm:text-sm text-slate-700 space-y-1.5 font-sans leading-relaxed">
                  <div className="font-bold text-slate-900 text-sm">
                    {activeDetailOrder.shipping_address?.full_name || activeDetailOrder.shipping_address?.fullName || "Customer"}
                  </div>
                  <div>{activeDetailOrder.shipping_address?.address || activeDetailOrder.shipping_address?.street}</div>
                  <div>
                    {activeDetailOrder.shipping_address?.city},{" "}
                    {activeDetailOrder.shipping_address?.state} -{" "}
                    {activeDetailOrder.shipping_address?.pincode}
                  </div>
                  <div className="text-slate-600 font-mono pt-1 flex items-center gap-3">
                    <span>Phone: {activeDetailOrder.shipping_address?.phone}</span>
                    {activeDetailOrder.shipping_address?.email && (
                      <span>Email: {activeDetailOrder.shipping_address?.email}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" />
                  Purchased Items ({activeDetailOrder.items?.length || 0})
                </h4>

                <div className="border border-slate-200 divide-y divide-slate-100">
                  {activeDetailOrder.items?.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <CustomImg
                            srcAttr={item.thumbnail}
                            altAttr={item.product_name}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-sm font-serif font-normal text-slate-900">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            Qty: {item.quantity} x ₹{parseFloat(item.price).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 font-sans">
                        ₹{(parseFloat(item.price) * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  Razorpay Payment Metadata
                </h4>

                <div className="bg-slate-50 border border-slate-200 p-5 space-y-3 text-xs sm:text-sm font-sans">
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Method:</span>
                    <span className="font-bold text-slate-900 font-mono uppercase">
                      {activeDetailOrder.payment_method || "razorpay"}
                    </span>
                  </div>
                  {activeDetailOrder.razorpay_order_id && (
                    <div className="flex justify-between text-slate-600">
                      <span>Razorpay Order ID:</span>
                      <span className="font-mono text-slate-900">{activeDetailOrder.razorpay_order_id}</span>
                    </div>
                  )}
                  {activeDetailOrder.razorpay_payment_id && (
                    <div className="flex justify-between text-slate-600">
                      <span>Razorpay Payment ID:</span>
                      <span className="font-mono text-emerald-700 font-bold">{activeDetailOrder.razorpay_payment_id}</span>
                    </div>
                  )}
                  <div className="w-full h-px bg-slate-200 my-1" />
                  <div className="flex justify-between text-base font-bold text-slate-900">
                    <span>Total Amount Paid:</span>
                    <span className="text-amber-700">
                      ₹{parseFloat(activeDetailOrder.total_amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border-t border-slate-200 p-6 flex justify-end">
              <button
                type="button"
                onClick={() => dispatch(setCurrentOrder(null))}
                className="px-8 py-3 bg-[#202A4E] hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Close Info
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
