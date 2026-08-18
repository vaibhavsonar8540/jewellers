import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "@/services/orderService";
import { clearCart } from "./cartSlice";

const initialState = {
  orders: [],
  currentOrder: null,
  pendingRazorpayOrder: null, // { order_id, order_number, razorpay_order_id, razorpay_key_id, amount, currency }
  loading: false,
  creatingOrder: false,
  verifyingPayment: false,
  cancellingOrderId: null,
  returningOrderId: null,
  error: null,
  successMessage: null,
};

// 1. Async Thunk: Fetch Order History
export const fetchOrderHistoryThunk = createAsyncThunk(
  "order/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const orders = await orderService.getUserOrderHistory();
      return orders;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load order history.");
    }
  }
);

// 2. Async Thunk: Create Razorpay Order via Supabase Edge Function
export const createRazorpayOrderThunk = createAsyncThunk(
  "order/createRazorpayOrder",
  async ({ shippingAddress, cartItems = [] }, { rejectWithValue }) => {
    try {
      const response = await orderService.createRazorpayOrder({
        shippingAddress,
        cartItems,
      });
      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create order on backend.");
    }
  }
);

// 3. Async Thunk: Verify Razorpay Payment Signature via Supabase Edge Function
export const verifyRazorpayPaymentThunk = createAsyncThunk(
  "order/verifyRazorpayPayment",
  async (
    { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await orderService.verifyRazorpayPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      // Clear local & DB cart upon verified payment
      dispatch(clearCart());

      // Refresh user's order history
      dispatch(fetchOrderHistoryThunk());

      return response;
    } catch (err) {
      return rejectWithValue(err.message || "Payment verification failed.");
    }
  }
);

// 4. Async Thunk: Cancel Order
export const cancelOrderThunk = createAsyncThunk(
  "order/cancelOrder",
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId);
      dispatch(fetchOrderHistoryThunk());
      return { orderId, response };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to cancel order.");
    }
  }
);

// 5. Async Thunk: Return Order Request
export const returnOrderThunk = createAsyncThunk(
  "order/returnOrder",
  async (orderId, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderService.returnOrder(orderId);
      dispatch(fetchOrderHistoryThunk());
      return { orderId, response };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to request return.");
    }
  }
);

// 6. Async Thunk: Update Order Status (Seller / Admin operation)
export const updateOrderStatusThunk = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, newStatus }, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderService.updateOrderStatus({ orderId, newStatus });
      dispatch(fetchOrderHistoryThunk());
      return { orderId, newStatus, response };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update order status.");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearPendingRazorpayOrder: (state) => {
      state.pendingRazorpayOrder = null;
    },
    clearOrderError: (state) => {
      state.error = null;
    },
    clearOrderSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Order History
      .addCase(fetchOrderHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
        state.error = null;
      })
      .addCase(fetchOrderHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Razorpay Order
      .addCase(createRazorpayOrderThunk.pending, (state) => {
        state.creatingOrder = true;
        state.error = null;
        state.pendingRazorpayOrder = null;
      })
      .addCase(createRazorpayOrderThunk.fulfilled, (state, action) => {
        state.creatingOrder = false;
        state.pendingRazorpayOrder = action.payload;
        state.error = null;
      })
      .addCase(createRazorpayOrderThunk.rejected, (state, action) => {
        state.creatingOrder = false;
        state.error = action.payload;
        state.pendingRazorpayOrder = null;
      })

      // Verify Razorpay Payment
      .addCase(verifyRazorpayPaymentThunk.pending, (state) => {
        state.verifyingPayment = true;
        state.error = null;
      })
      .addCase(verifyRazorpayPaymentThunk.fulfilled, (state, action) => {
        state.verifyingPayment = false;
        state.pendingRazorpayOrder = null;
        state.successMessage = action.payload?.message || "Payment verified successfully!";
        state.error = null;
      })
      .addCase(verifyRazorpayPaymentThunk.rejected, (state, action) => {
        state.verifyingPayment = false;
        state.error = action.payload;
      })

      // Cancel Order
      .addCase(cancelOrderThunk.pending, (state, action) => {
        state.cancellingOrderId = action.meta.arg;
        state.error = null;
      })
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.cancellingOrderId = null;
        state.successMessage = action.payload?.response?.message || "Order cancelled successfully.";
        state.error = null;
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.cancellingOrderId = null;
        state.error = action.payload;
      })

      // Return Order
      .addCase(returnOrderThunk.pending, (state, action) => {
        state.returningOrderId = action.meta.arg;
        state.error = null;
      })
      .addCase(returnOrderThunk.fulfilled, (state, action) => {
        state.returningOrderId = null;
        state.successMessage = action.payload?.response?.message || "Return requested successfully.";
        state.error = null;
      })
      .addCase(returnOrderThunk.rejected, (state, action) => {
        state.returningOrderId = null;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentOrder,
  clearCurrentOrder,
  clearPendingRazorpayOrder,
  clearOrderError,
  clearOrderSuccess,
} = orderSlice.actions;

// Selectors
export const selectAllOrders = (state) => state?.order?.orders || [];
export const selectCurrentOrder = (state) => state?.order?.currentOrder || null;
export const selectPendingRazorpayOrder = (state) => state?.order?.pendingRazorpayOrder || null;
export const selectOrderLoading = (state) => Boolean(state?.order?.loading);
export const selectCreatingOrder = (state) => Boolean(state?.order?.creatingOrder);
export const selectVerifyingPayment = (state) => Boolean(state?.order?.verifyingPayment);
export const selectCancellingOrderId = (state) => state?.order?.cancellingOrderId || null;
export const selectReturningOrderId = (state) => state?.order?.returningOrderId || null;
export const selectOrderError = (state) => state?.order?.error || null;
export const selectOrderSuccess = (state) => state?.order?.successMessage || null;

export default orderSlice.reducer;
