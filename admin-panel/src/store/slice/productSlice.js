import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  isSubmitting: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload || [];
    },
    addProduct: (state, action) => {
      if (action.payload) {
        state.products.unshift(action.payload);
      }
    },
    updateProductInState: (state, action) => {
      if (action.payload && action.payload.id) {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...action.payload };
        }
      }
    },
    removeProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    toggleProductActiveInState: (state, action) => {
      const { id, is_active } = action.payload || {};
      const index = state.products.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.products[index].is_active = is_active;
      }
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    setProductLoading: (state, action) => {
      state.loading = !!action.payload;
    },
    setIsSubmitting: (state, action) => {
      state.isSubmitting = !!action.payload;
    },
    setProductError: (state, action) => {
      state.error = action.payload;
    },
    clearProductError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProductInState,
  removeProduct,
  toggleProductActiveInState,
  setCurrentProduct,
  setProductLoading,
  setIsSubmitting,
  setProductError,
  clearProductError,
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.product?.products || [];
export const selectCurrentProduct = (state) => state.product?.currentProduct || null;
export const selectProductLoading = (state) => state.product?.loading || false;
export const selectIsSubmitting = (state) => state.product?.isSubmitting || false;
export const selectProductError = (state) => state.product?.error || null;

export default productSlice.reducer;
