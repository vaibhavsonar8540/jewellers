import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    collection: [],
    category: [],
    subCategory: [],
};

const commonSlice = createSlice({
    name: "common",
    initialState,
    reducers: {
        setCollection: (state, action) => {
            state.collection = action.payload;
        },
        setCategory: (state, action) => {
            state.category = action.payload;
        },
        setSubCategory: (state, action) => {
            state.subCategory = action.payload;
        },
    },
});

export const { setCollection, setCategory, setSubCategory } = commonSlice.actions;
export default commonSlice.reducer;