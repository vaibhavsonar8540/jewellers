import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "@/services/productService";
import { fetchActiveProductsService } from "@/lib/productService";

const initialState = {
  // Single Product Details State
  product: null,
  mediaList: [],
  productColors: [],
  productPurities: [],
  ringSizesList: [],
  diamondShapeData: null,
  diamondShapes: [],
  variationCombo: [],

  // Global Products Catalog State
  activeProducts: [],
  collectionsList: [],
  categoriesList: [],
  subCategoriesList: [],
  colorsList: [],
  puritiesList: [],
  catalogLoading: false,

  // Selected Variant Options State
  selectedColor: null,
  selectedPurity: null,
  selectedRingSize: "",
  selectedDiamondShape: null,
  quantity: 1,

  loading: true,
  error: null,
};

// 1. Async Thunk: Fetch Single Product Details
export const fetchProductDetails = createAsyncThunk(
  "product/fetchProductDetails",
  async (productId, { rejectWithValue }) => {
    try {
      const data = await productService.fetchProductById(productId);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load product details.");
    }
  }
);

// 2. Async Thunk: Fetch All Active Products Catalog & Taxonomy
export const fetchActiveProducts = createAsyncThunk(
  "product/fetchActiveProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchActiveProductsService();
      if (res.error) {
        return rejectWithValue(res.error.message || "Failed to load active products.");
      }
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load active products.");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSelectedColor: (state, action) => {
      state.selectedColor = action.payload;
    },
    setSelectedPurity: (state, action) => {
      state.selectedPurity = action.payload;
    },
    setSelectedRingSize: (state, action) => {
      state.selectedRingSize = action.payload;
    },
    setSelectedDiamondShape: (state, action) => {
      state.selectedDiamondShape = action.payload;
    },
    setQuantity: (state, action) => {
      state.quantity = Math.max(1, action.payload);
    },
    incrementQuantity: (state) => {
      state.quantity += 1;
    },
    decrementQuantity: (state) => {
      state.quantity = Math.max(1, state.quantity - 1);
    },
    resetProductState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Single Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        const { product, mediaList, colors, purities, ringSizes, diamondShape, diamondShapes, variationCombo } = action.payload;
        state.loading = false;
        state.product = product;
        state.mediaList = mediaList;
        state.productColors = colors;
        state.productPurities = purities;
        state.ringSizesList = ringSizes;
        state.diamondShapeData = diamondShape;
        state.diamondShapes = diamondShapes || [];
        state.variationCombo = variationCombo || [];

        // Auto-select defaults
        state.selectedColor = colors.length > 0 ? colors[0] : null;
        state.selectedPurity = purities.length > 0 ? purities[0] : null;
        state.selectedDiamondShape = (diamondShapes && diamondShapes.length > 0) ? diamondShapes[0] : diamondShape;
        state.selectedRingSize =
          ringSizes.length > 0 ? ringSizes[0].name || ringSizes[0].size_in_mm || "" : "";
        state.quantity = 1;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // All Active Products Catalog
      .addCase(fetchActiveProducts.pending, (state) => {
        state.catalogLoading = true;
      })
      .addCase(fetchActiveProducts.fulfilled, (state, action) => {
        state.catalogLoading = false;
        state.activeProducts = action.payload.data || [];
        state.collectionsList = action.payload.collections || [];
        state.categoriesList = action.payload.categories || [];
        state.subCategoriesList = action.payload.subCategories || [];
        state.colorsList = action.payload.colors || [];
        state.puritiesList = action.payload.purities || [];
      })
      .addCase(fetchActiveProducts.rejected, (state, action) => {
        state.catalogLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedColor,
  setSelectedPurity,
  setSelectedRingSize,
  setSelectedDiamondShape,
  setQuantity,
  incrementQuantity,
  decrementQuantity,
  resetProductState,
} = productSlice.actions;

// Selectors
export const selectCurrentProduct = (state) => state.product.product;
export const selectMediaList = (state) => state.product.mediaList;
export const selectProductColors = (state) => state.product.productColors;
export const selectProductPurities = (state) => state.product.productPurities;
export const selectRingSizesList = (state) => state.product.ringSizesList;
export const selectDiamondShapeData = (state) => state.product.diamondShapeData;
export const selectDiamondShapesList = (state) => state.product.diamondShapes;
export const selectVariationComboList = (state) => state.product.variationCombo;

export const selectAllActiveProducts = (state) => state.product.activeProducts;
export const selectCollectionsList = (state) => state.product.collectionsList;
export const selectCategoriesList = (state) => state.product.categoriesList;
export const selectSubCategoriesList = (state) => state.product.subCategoriesList;
export const selectCatalogLoading = (state) => state.product.catalogLoading;

export const selectSelectedColor = (state) => state.product.selectedColor;
export const selectSelectedPurity = (state) => state.product.selectedPurity;
export const selectSelectedRingSize = (state) => state.product.selectedRingSize;
export const selectSelectedDiamondShape = (state) => state.product.selectedDiamondShape;
export const selectProductQuantity = (state) => state.product.quantity;

export const selectProductLoading = (state) => state.product.loading;
export const selectProductError = (state) => state.product.error;

export default productSlice.reducer;
