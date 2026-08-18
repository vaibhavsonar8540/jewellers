import {
  getProductsService,
  createProductService,
  updateProductService,
  deleteProductService,
  toggleProductActiveService,
} from "@/service/common.service";

import {
  setProducts,
  addProduct,
  updateProductInState,
  removeProduct,
  toggleProductActiveInState,
  setProductLoading,
  setIsSubmitting,
  setProductError,
} from "@/store/slice/productSlice";

/**
 * Fetch all products action and store in Redux productSlice.
 */
export const fetchProductsAction = () => async (dispatch) => {
  dispatch(setProductLoading(true));
  dispatch(setProductError(null));
  try {
    const res = await getProductsService();
    if (res.error) {
      dispatch(setProductError(res.error.message || "Failed to fetch products."));
      dispatch(setProductLoading(false));
      return res;
    }
    dispatch(setProducts(res.data || []));
    dispatch(setProductLoading(false));
    return res;
  } catch (error) {
    console.error("Action fetchProductsAction Error:", error);
    dispatch(setProductError(error.message || "Failed to fetch products."));
    dispatch(setProductLoading(false));
    return { data: [], error: { message: error.message || "Failed to fetch products." } };
  }
};

/**
 * Create product action and store in Redux productSlice.
 */
export const createProductAction = (payload) => async (dispatch) => {
  dispatch(setIsSubmitting(true));
  dispatch(setProductError(null));
  try {
    const res = await createProductService(payload);
    if (res.error) {
      dispatch(setProductError(res.error.message || "Failed to create product."));
      dispatch(setIsSubmitting(false));
      return res;
    }
    if (res.data) {
      dispatch(addProduct(res.data));
    }
    dispatch(setIsSubmitting(false));
    return res;
  } catch (error) {
    console.error("Action createProductAction Error:", error);
    dispatch(setProductError(error.message || "An unexpected error occurred."));
    dispatch(setIsSubmitting(false));
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

/**
 * Update product action and sync Redux productSlice.
 */
export const updateProductAction = (payload) => async (dispatch) => {
  dispatch(setIsSubmitting(true));
  dispatch(setProductError(null));
  try {
    const res = await updateProductService(payload);
    if (res.error) {
      dispatch(setProductError(res.error.message || "Failed to update product."));
      dispatch(setIsSubmitting(false));
      return res;
    }
    if (res.data) {
      dispatch(updateProductInState(res.data));
    }
    dispatch(setIsSubmitting(false));
    return res;
  } catch (error) {
    console.error("Action updateProductAction Error:", error);
    dispatch(setProductError(error.message || "An unexpected error occurred."));
    dispatch(setIsSubmitting(false));
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

/**
 * Delete product action and update Redux productSlice.
 */
export const deleteProductAction = (productId) => async (dispatch) => {
  try {
    const res = await deleteProductService(productId);
    if (res.error) {
      return res;
    }
    dispatch(removeProduct(productId));
    return res;
  } catch (error) {
    console.error("Action deleteProductAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to delete product." } };
  }
};

/**
 * Toggle product active status action and update Redux productSlice.
 */
export const toggleProductActiveAction = ({ id, is_active }) => async (dispatch) => {
  try {
    const res = await toggleProductActiveService({ id, is_active });
    if (!res.error) {
      dispatch(toggleProductActiveInState({ id, is_active }));
    }
    return res;
  } catch (error) {
    console.error("Action toggleProductActiveAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to toggle product status." } };
  }
};
