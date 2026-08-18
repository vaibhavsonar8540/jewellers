import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slice/cartSlice";
import authReducer from "./slice/authSlice";
import productReducer from "./slice/productSlice";
import orderReducer from "./slice/orderSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    product: productReducer,
    order: orderReducer,
  },
});

