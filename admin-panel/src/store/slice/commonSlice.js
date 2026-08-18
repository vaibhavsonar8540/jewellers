import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  collection: [],
  category: [],
  subCategory: [],
  diamondShapes: [],
  colors: [],
  karats: [],
  colorKarats: [],
  ringSizes: [],
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setCollection: (state, action) => {
      state.collection = action.payload || [];
    },
    setCategory: (state, action) => {
      state.category = action.payload || [];
    },
    setSubCategory: (state, action) => {
      state.subCategory = action.payload || [];
    },
    setDiamondShapes: (state, action) => {
      state.diamondShapes = action.payload || [];
    },
    setColors: (state, action) => {
      state.colors = action.payload || [];
    },
    setKarats: (state, action) => {
      state.karats = action.payload || [];
    },
    setColorKarats: (state, action) => {
      state.colorKarats = action.payload || [];
    },
    setRingSizes: (state, action) => {
      state.ringSizes = action.payload || [];
    },
  },
});

export const {
  setCollection,
  setCategory,
  setSubCategory,
  setDiamondShapes,
  setColors,
  setKarats,
  setColorKarats,
  setRingSizes,
} = commonSlice.actions;

export default commonSlice.reducer;