"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/db";
import CustomImg from "@/components/CustomImg";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const orderNumberParam = searchParams.get("order_number");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (data) {
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order confirmation details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        {/* Success Card Header */}
        <div className="bg-white border border-slate-200/80 p-8 sm:p-12 text-center shadow-xl space-y-6">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-12 h-12 stroke-[1.8]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay Verified Payment</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-canela font-normal text-slate-900">
              Payment Successful!
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-sans max-w-lg mx-auto">
              Thank you for shopping with Luxury Jewellers. Your order has been placed and confirmed successfully.
            </p>
          </div>

          {/* Order Reference Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto text-center sm:text-left font-mono">
            <div className="w-full sm:w-auto flex flex-col items-center sm:items-start">
              <div className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider">Order Number</div>
              <div className="text-base sm:text-xl font-bold text-slate-900 break-all sm:break-normal">
                {order?.order_number || orderNumberParam || "ORD-PROCESSING"}
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col items-center sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
              <div className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider mb-1">Payment Status</div>
              <span className="inline-block px-3.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full uppercase tracking-wider">
                {order?.payment_status || "Paid"}
              </span>
            </div>
          </div>

          {/* Order Details Preview */}
          {order && (
            <div className="border-t border-slate-100 pt-8 text-left space-y-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-canela font-normal text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                Purchased Items ({Array.isArray(order.items) ? order.items.length : 0})
              </h3>

              <div className="divide-y divide-slate-100">
                {Array.isArray(order.items) &&
                  order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                          <CustomImg
                            srcAttr={item.thumbnail}
                            altAttr={item.product_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 font-canela">
                            {item.product_name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            Qty: {item.quantity} x ₹{item.price?.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-900 font-sans">
                        ₹{(item.total || item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Total Paid & Address Summary */}
              <div className="bg-slate-50 p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Shipping Address:</span>
                  <p className="text-slate-600 leading-relaxed font-mono">
                    {order.shipping_address?.full_name} <br />
                    {order.shipping_address?.address}, {order.shipping_address?.city},{" "}
                    {order.shipping_address?.state} - {order.shipping_address?.pincode} <br />
                    Phone: {order.shipping_address?.phone}
                  </p>
                </div>
                <div className="sm:text-right space-y-1">
                  <span className="font-semibold text-slate-700 block">Total Paid:</span>
                  <div className="text-2xl font-bold text-amber-700">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </div>
                  {order.razorpay_payment_id && (
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      Razorpay Payment ID: {order.razorpay_payment_id}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/orders"
              className="w-full sm:w-auto px-8 py-4 bg-[#1A2238] hover:bg-black text-white text-xs font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2 transition-colors rounded-none shadow-md"
            >
              <Package className="w-4 h-4" /> View My Orders
            </Link>

            <Link
              href="/collection/jewellery"
              className="w-full sm:w-auto px-8 py-4 border border-slate-300 hover:border-black text-xs font-bold uppercase tracking-wider text-slate-800 transition-colors inline-flex items-center justify-center gap-2 rounded-none"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
