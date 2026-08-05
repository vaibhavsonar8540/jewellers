import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isLoading: false,
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    loggedOut: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, setIsLoading, loggedOut } = commonSlice.actions;
export default commonSlice.reducer;
