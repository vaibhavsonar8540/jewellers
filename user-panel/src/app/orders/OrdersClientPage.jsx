"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  X,
  CreditCard,
  MapPin,
  Calendar,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import CustomImg from "@/components/CustomImg";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/db";

/**
 * Robust order item parser utility function.
 */
export function parseOrderItems(order) {
  if (!order) return [];

  let rawItems =
    order.items ||
    order.order_items ||
    order.cart_items ||
    order.items_json ||
    order.order_details ||
    order.products ||
    [];

  if (typeof rawItems === "string") {
    try {
      rawItems = JSON.parse(rawItems);
    } catch (e) {
      console.warn("Failed to parse items string:", e);
      rawItems = [];
    }
  }

  if (!Array.isArray(rawItems)) {
    if (typeof rawItems === "object" && rawItems !== null) {
      rawItems = [rawItems];
    } else {
      rawItems = [];
    }
  }

  return rawItems.map((item, index) => {
    const title =
      item.product_name ||
      item.name ||
      item.title ||
      item.product?.name ||
      `Jewelry Item #${index + 1}`;

    const thumb =
      item.thumbnail ||
      item.image ||
      item.img ||
      item.product?.thumbnail ||
      item.product?.image ||
      (Array.isArray(item.images) ? item.images[0] : "") ||
      "";

    const price = parseFloat(
      item.price || item.unit_price || item.selling_price || item.amount || 0
    );

    const qty = parseInt(item.quantity || item.qty || item.count || 1, 10);
    const lineTotal = item.total ? parseFloat(item.total) : price * qty;
    const sku = item.sku || item.product?.sku || item.id || "";

    const specs = [
      item.color || item.variation_combo?.color || item.metal_color,
      item.purity || item.variation_combo?.purity,
      item.ring_size || item.ringSize || item.variation_combo?.ring_size
        ? `Size: ${item.ring_size || item.ringSize || item.variation_combo?.ring_size}`
        : null,
      item.diamond_shape || item.diamondShape,
      item.diamond_quality || item.diamondQuality,
    ].filter(Boolean);

    return {
      id: item.id || index,
      title,
      image: thumb,
      price,
      quantity: qty,
      lineTotal,
      sku,
      specs,
    };
  });
}

export default function OrdersClientPage() {
  const router = useRouter();
  const { user } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchUserOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchErr } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setError(err.message || "Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending")
      return order.order_status === "pending" || order.order_status === "processing";
    if (statusFilter === "paid")
      return order.payment_status === "paid" || order.payment_status === "completed";
    if (statusFilter === "shipped") return order.order_status === "shipped";
    if (statusFilter === "delivered") return order.order_status === "delivered";
    if (statusFilter === "cancelled") return order.order_status === "cancelled";
    return true;
  });

  const getStatusBadge = (orderStatus, paymentStatus) => {
    const status = (orderStatus || "pending").toLowerCase();
    const pay = (paymentStatus || "pending").toLowerCase();

    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    }

    if (status === "delivered") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    }

    if (status === "shipped") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Truck className="w-3.5 h-3.5" /> Shipped
        </span>
      );
    }

    if (pay === "paid" || pay === "completed" || status === "processing") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Clock className="w-3.5 h-3.5" /> Processing Order
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Pending Payment
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-24">
      {/* Breadcrumb Header */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-normal">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-medium">My Orders</span>
        </nav>
      </div>

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-slate-900 font-normal tracking-wide">
              Order History & Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
              View and track all your luxury fine jewelry purchases
            </p>
          </div>

          <button
            onClick={fetchUserOrders}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors border border-slate-200 px-3 py-1.5 rounded-none bg-white shadow-xs w-fit cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
          </button>
        </div>

        {!user ? (
          /* Not Logged In View */
          <div className="bg-white border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto my-12 shadow-xs">
            <Package className="w-12 h-12 text-slate-400 mx-auto stroke-[1.5]" />
            <h2 className="text-xl font-serif text-slate-900">Please Sign In</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You must be logged in to view your order history and live delivery tracking details.
            </p>
            <button
              onClick={() => router.push("/profile")}
              className="mt-4 px-6 py-3 bg-[#1A2238] hover:bg-black text-white text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Fetching your orders from database...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-4 max-w-2xl mx-auto my-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchUserOrders}
              className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded hover:bg-rose-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          /* Empty Orders View */
          <div className="bg-white border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto my-12 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto stroke-[1.3]" />
            <h2 className="text-xl font-serif text-slate-900">No Orders Found</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't placed any jewelry orders yet. Discover our handcrafted diamond & gold collections today.
            </p>
            <Link
              href="/collection/jewellery"
              className="mt-4 px-6 py-3 bg-[#1A2238] hover:bg-black text-white text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          /* Orders List View */
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-medium">
              {[
                { id: "all", label: `All Orders (${orders.length})` },
                { id: "pending", label: "Processing" },
                { id: "paid", label: "Paid" },
                { id: "shipped", label: "Shipped" },
                { id: "delivered", label: "Delivered" },
                { id: "cancelled", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-2 rounded-none transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab.id
                      ? "bg-[#1A2238] text-white font-bold"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders Feed */}
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const parsedItems = parseOrderItems(order);
                const orderDate = order.created_at
                  ? new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A";

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Order Number</span>
                          <span className="font-bold text-slate-900">{order.order_number || order.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Date Placed</span>
                          <span className="text-slate-700">{orderDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase">Total Paid</span>
                          <span className="font-bold text-slate-900 font-sans text-sm">
                            ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.order_status, order.payment_status)}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-black hover:border-black font-sans font-semibold text-xs transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Items Preview List */}
                    <div className="p-4 sm:p-6 divide-y divide-slate-100">
                      {parsedItems.map((item, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                              <CustomImg
                                srcAttr={item.image}
                                altAttr={item.title}
                                width={56}
                                height={56}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-semibold font-canela text-slate-900 truncate">
                                {item.title}
                              </h4>
                              {item.specs.length > 0 && (
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  {item.specs.join(" | ")}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-400 font-mono">
                                Qty: {item.quantity} x ₹{item.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          <div className="text-xs sm:text-sm font-bold text-slate-900 font-sans shrink-0">
                            ₹{item.lineTotal.toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end font-sans">
          <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="font-serif text-lg font-normal">Order Details</h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5">{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Order Status Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono block">Order Status</span>
                  <span className="text-sm font-bold capitalize text-slate-900">
                    {selectedOrder.order_status || "Processing"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-mono block text-right">Payment</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-mono">
                    {selectedOrder.payment_status || "Paid"}
                  </span>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700">Order Items</h4>
                <div className="border border-slate-200 divide-y divide-slate-100">
                  {parseOrderItems(selectedOrder).map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div className="w-12 h-12 bg-white border border-slate-100 flex items-center justify-center p-1 shrink-0">
                        <CustomImg
                          srcAttr={item.image}
                          altAttr={item.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Qty: {item.quantity} • ₹{item.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-900 font-sans">
                        ₹{item.lineTotal.toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> Delivery Address
                  </h4>
                  <div className="p-4 bg-slate-50 border border-slate-200 text-xs font-mono leading-relaxed text-slate-700">
                    <p className="font-bold text-slate-900">{selectedOrder.shipping_address.full_name}</p>
                    <p>{selectedOrder.shipping_address.address}</p>
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} -{" "}
                      {selectedOrder.shipping_address.pincode}
                    </p>
                    <p className="mt-1 text-slate-500">Phone: {selectedOrder.shipping_address.phone}</p>
                  </div>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal:</span>
                  <span>₹{Number(selectedOrder.total_amount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Insured Express Shipping:</span>
                  <span className="text-emerald-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span>₹{Number(selectedOrder.total_amount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-[#1A2238] hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
