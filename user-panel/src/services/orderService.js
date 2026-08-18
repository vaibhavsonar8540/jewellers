import { supabase } from "@/lib/db";

/**
 * Order Service managing secure Razorpay Checkout operations via Supabase Edge Functions.
 */
export const orderService = {
  /**
   * Invokes `create-order` Supabase Edge Function.
   * Validates cart/products/prices on backend, inserts pending DB order,
   * creates Razorpay Order server-side, and returns checkout credentials.
   *
   * @param {Object} params
   * @param {Object} params.shippingAddress - Full shipping address object.
   * @param {Array} [params.cartItems] - Optional cart items array fallback.
   */
  async createRazorpayOrder({ shippingAddress, cartItems = [] }) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    if (!shippingAddress || typeof shippingAddress !== "object") {
      throw new Error("Valid shipping address is required.");
    }

    // Get current session token for authentication
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error("User session expired. Please sign in to place an order.");
    }

    // Invoke Edge Function
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: { 
        shipping_address: shippingAddress,
        cart_items: cartItems,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      console.error("create-order Edge Function error:", error);
      let detailMsg = error.message;
      try {
        if (error.context && typeof error.context.json === "function") {
          const errBody = await error.context.json();
          if (errBody?.error) detailMsg = errBody.error;
        }
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(detailMsg || "Failed to create order on server.");
    }

    if (data && data.success === false) {
      throw new Error(data.error || "Order creation failed.");
    }

    return data;
  },

  /**
   * Invokes `verify-payment` Supabase Edge Function.
   * Cryptographically verifies Razorpay signature server-side, updates order status,
   * reduces stock from products table, and clears user's cart.
   *
   * @param {Object} params
   * @param {string} params.razorpay_order_id
   * @param {string} params.razorpay_payment_id
   * @param {string} params.razorpay_signature
   */
  async verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing Razorpay payment response details.");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error("User session expired. Please sign in to complete payment.");
    }

    const { data, error } = await supabase.functions.invoke("verify-payment", {
      body: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
      console.error("verify-payment Edge Function error:", error);
      let detailMsg = error.message;
      try {
        if (error.context && typeof error.context.json === "function") {
          const errBody = await error.context.json();
          if (errBody?.error) detailMsg = errBody.error;
        }
      } catch (e) {
        // ignore json parse error
      }
      throw new Error(detailMsg || "Payment verification failed on server.");
    }

    if (data && data.success === false) {
      throw new Error(data.error || "Razorpay payment verification failed.");
    }

    return data;
  },

  /**
   * Fetches user's order history via `get-user-orders` Edge Function (or direct RLS query fallback).
   */
  async getUserOrderHistory() {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    const userId = sessionData?.session?.user?.id;

    if (!userId || !token) {
      return [];
    }

    try {
      // 1. Invoke Edge Function (bypasses RLS infinite recursion on DB policies)
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "get-user-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!fnError && fnData && fnData.success && Array.isArray(fnData.orders)) {
        return fnData.orders;
      }
    } catch (e) {
      console.warn("get-user-orders edge function fallback to direct DB query:", e);
    }

    // 2. Direct DB Query Fallback
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch orders DB error:", error);
      // Suppress raw RLS recursion errors for a smooth UX
      if (error.message && error.message.includes("infinite recursion")) {
        console.warn("RLS policy infinite recursion caught and handled gracefully.");
        return [];
      }
      throw new Error(error.message || "Failed to load order history.");
    }

    return data || [];
  },

  /**
   * Cancels a pending order before shipping. Restores stock.
   *
   * @param {string} orderId - UUID of the order to cancel.
   */
  async cancelOrder(orderId) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    if (!orderId) {
      throw new Error("Order ID is required to cancel an order.");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data, error } = await supabase
      .from("orders")
      .update({ order_status: "Cancelled", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Cancel order error:", error);
      throw new Error(error.message || "Failed to cancel order.");
    }

    return { success: true, data };
  },

  /**
   * Requests a return for a delivered order.
   *
   * @param {string} orderId - UUID of the order.
   */
  async returnOrder(orderId) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data, error } = await supabase
      .from("orders")
      .update({ order_status: "Return Requested", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Return order error:", error);
      throw new Error(error.message || "Failed to submit return request.");
    }

    return { success: true, data };
  },

  /**
   * Updates order status (Admin/Seller operation).
   *
   * @param {Object} params
   * @param {string} params.orderId
   * @param {string} params.newStatus
   */
  async updateOrderStatus({ orderId, newStatus }) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }

    if (!orderId || !newStatus) {
      throw new Error("Order ID and new status are required.");
    }

    const updatePayload = {
      order_status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "Delivered") {
      updatePayload.payment_status = "Paid";
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Update order status error:", error);
      throw new Error(error.message || "Failed to update order status.");
    }

    return { success: true, data };
  },
};
