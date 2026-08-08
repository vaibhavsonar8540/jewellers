import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    session: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.loading = false;
            state.error = null;
        },
        setSession: (state, action) => {
            state.session = action.payload;
        },
        clearAuth: (state) => {
            state.user = null;
            state.session = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        setAuthLoading: (state, action) => {
            state.loading = action.payload;
        },
        setAuthError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    setUser,
    setSession,
    clearAuth,
    setAuthLoading,
    setAuthError,
} = authSlice.actions;

export default authSlice.reducer;
