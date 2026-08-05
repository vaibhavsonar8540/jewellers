import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slice/commonSlice";

export const Store = configureStore({
  reducer: {
    common: commonReducer,
  },
});

export default Store;