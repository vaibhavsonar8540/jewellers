import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService } from "@/services/cartService";

// Initial State
const initialState = {
  cartItems: [],
  isCartOpen: false,
  isCartLoaded: false,
  loading: false,
  syncing: false,
  error: null,
  stockWarning: "",
};

// 1. Async Thunk: Fetch Cart from Supabase or Local Storage
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      let items = [];

      if (userId) {
        // Fetch from Supabase DB for logged-in user
        const dbItems = await cartService.fetchUserCartFromDb(userId);
        // Merge any remaining guest items in local storage into user cart
        items = cartService.mergeGuestCartIntoUserCart(dbItems);
      } else {
        // Fallback to local storage cache for guest users
        items = cartService.getLocalCart(null);
      }

      return { items, userId };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch cart");
    }
  }
);

// 2. Async Thunk: Sync Cart with Supabase Database RPC
export const syncCart = createAsyncThunk(
  "cart/syncCart",
  async ({ userId, cartItems }, { rejectWithValue }) => {
    try {
      // 1. Instant local storage cache save
      cartService.setLocalCart(userId, cartItems);

      // 2. Database RPC sync for logged-in users
      if (userId) {
        await cartService.syncUserCartToDb(userId, cartItems);
      }

      return true;
    } catch (err) {
      console.warn("Supabase cart sync error:", err);
      return rejectWithValue(err.message || "Failed to sync cart with database");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    clearStockWarning: (state) => {
      state.stockWarning = "";
    },

    // Add item to cart with stock validation
    addToCart: (state, action) => {
      state.stockWarning = "";
      const productData = action.payload;
      const itemStock = typeof productData.stock === "number" ? productData.stock : 999;

      if (itemStock <= 0) {
        state.stockWarning = `Sorry, "${productData.name}" is currently out of stock.`;
        return;
      }

      const itemKey = `${productData.id}-${productData.color || ""}-${productData.purity || ""}-${productData.ringSize || ""}`;
      const requestedQty = productData.quantity || 1;

      const existingIndex = state.cartItems.findIndex((item) => item.key === itemKey);

      if (existingIndex > -1) {
        const existingItem = state.cartItems[existingIndex];
        const currentQty = existingItem.quantity || 0;
        const newQty = currentQty + requestedQty;

        if (newQty > itemStock) {
          state.stockWarning = `Only ${itemStock} units of "${productData.name}" available in stock. Maximum limit reached.`;
          state.cartItems[existingIndex].quantity = itemStock;
          state.cartItems[existingIndex].stock = itemStock;
        } else {
          state.cartItems[existingIndex].quantity = newQty;
          state.cartItems[existingIndex].stock = itemStock;
        }
      } else {
        const actualQty = Math.min(requestedQty, itemStock);
        if (actualQty < requestedQty) {
          state.stockWarning = `Only ${itemStock} units of "${productData.name}" available in stock.`;
        }

        state.cartItems.push({
          key: itemKey,
          id: productData.id,
          name: productData.name,
          price: parseFloat(productData.price || 0),
          image:
            productData.image ||
            productData.thumbnail ||
            (Array.isArray(productData.images) ? productData.images[0] : "") ||
            productData.media_mapping?.[0]?.thumbnail ||
            "",
          color: productData.color || "",
          purity: productData.purity || "",
          ringSize: productData.ringSize || "",
          sku: productData.sku || "",
          diamondType: productData.diamondType || "",
          diamondShape: productData.diamondShape || "",
          diamondQuality: productData.diamondQuality || "",
          stock: itemStock,
          quantity: actualQty,
        });
      }

      state.isCartOpen = true;
    },

    // Update Item Quantity (+1 / -1)
    updateQuantity: (state, action) => {
      state.stockWarning = "";
      const { key, delta } = action.payload;

      const index = state.cartItems.findIndex((item) => item.key === key);
      if (index > -1) {
        const item = state.cartItems[index];
        const maxStock = typeof item.stock === "number" ? item.stock : 999;
        const newQty = item.quantity + delta;

        if (delta > 0 && newQty > maxStock) {
          state.stockWarning = `Cannot increase quantity. Maximum available stock for "${item.name}" is ${maxStock}.`;
          state.cartItems[index].quantity = maxStock;
        } else if (newQty <= 0) {
          state.cartItems.splice(index, 1);
        } else {
          state.cartItems[index].quantity = newQty;
        }
      }
    },

    // Remove Item from Cart
    removeFromCart: (state, action) => {
      state.stockWarning = "";
      const key = action.payload;
      state.cartItems = state.cartItems.filter((item) => item.key !== key);
    },

    // Clear All Cart Items
    clearCart: (state) => {
      state.stockWarning = "";
      state.cartItems = [];
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isCartLoaded = false;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.items;
        state.isCartLoaded = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isCartLoaded = true;
      })
      // Sync Cart
      .addCase(syncCart.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncCart.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      });
  },
});

// Actions Export
export const {
  openCart,
  closeCart,
  toggleCart,
  clearStockWarning,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state?.cart?.cartItems || [];
export const selectIsCartOpen = (state) => Boolean(state?.cart?.isCartOpen);
export const selectIsCartLoaded = (state) => Boolean(state?.cart?.isCartLoaded);
export const selectCartLoading = (state) => Boolean(state?.cart?.loading);
export const selectCartStockWarning = (state) => state?.cart?.stockWarning || null;

export const selectCartSubtotal = (state) =>
  (state?.cart?.cartItems || []).reduce((acc, item) => acc + item.price * item.quantity, 0);

export const selectCartTotalCount = (state) =>
  (state?.cart?.cartItems || []).reduce((acc, item) => acc + item.quantity, 0);

export default cartSlice.reducer;
