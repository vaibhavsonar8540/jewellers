import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "@/services/authService";

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMsg: null,
};

// 1. Async Thunk: Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const result = await authService.login({ email, password });
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Invalid login credentials.");
    }
  }
);

// 2. Async Thunk: Register User
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, phone, password }, { rejectWithValue }) => {
    try {
      const result = await authService.register({ name, email, phone, password });
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Registration failed.");
    }
  }
);

// 3. Async Thunk: Logout User
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to log out.");
    }
  }
);

// 4. Async Thunk: Check Auth Session on Initial Load
export const checkAuthSession = createAsyncThunk(
  "auth/checkAuthSession",
  async (_, { rejectWithValue }) => {
    try {
      const authData = await authService.getCurrentAuthUser();
      return authData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload?.user || null;
      state.profile = action.payload?.profile || null;
      state.isAuthenticated = !!action.payload?.user;
      state.loading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    clearAuthSuccess: (state) => {
      state.successMsg = null;
    },
    setAuthSuccess: (state, action) => {
      state.successMsg = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.successMsg = "Welcome back! Login successful.";
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMsg = null;
      })

      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMsg = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.successMsg = "Account created successfully!";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMsg = null;
      })

      // Logout User
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.successMsg = null;
      })

      // Check Auth Session
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        if (action.payload?.user) {
          state.user = action.payload.user;
          state.profile = action.payload.profile;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.profile = null;
          state.isAuthenticated = false;
        }
        state.loading = false;
      });
  },
});

export const { setUser, clearAuthError, clearAuthSuccess, setAuthSuccess } =
  authSlice.actions;

// Selectors
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthProfile = (state) => state.auth.profile;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthSuccess = (state) => state.auth.successMsg;

export default authSlice.reducer;
