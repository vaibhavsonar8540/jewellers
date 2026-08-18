import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slice/commonSlice";
import authReducer from "./slice/authSlice";
import productReducer from "./slice/productSlice";

export const store = configureStore({
    reducer: {
        common: commonReducer,
        auth: authReducer,
        product: productReducer,
    },
});

