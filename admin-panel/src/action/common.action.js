import {
  collectionService,
  getCollectionsService,
  getCategoriesService,
  createCategoryService,
  getSubCategoriesService,
  createSubCategoryService,
  getDiamondShapesService,
  createDiamondShapeService,
  getColorsService,
  createColorService,
  getRingSizesService,
  createRingSizeService,
  getPuritiesService,
  createPurityService,
  getProductsService,
  createProductService,
  toggleProductActiveService,
  updateProductService,
  deleteProductService,
  removeProductMediaService,
} from "@/service/common.service";

export const createCollection = async (payload) => {
  try {
    const res = await collectionService(payload);
    return res;
  } catch (error) {
    console.error("Action createCollection Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const fetchCollectionsAction = async () => {
  try {
    const res = await getCollectionsService();
    return res;
  } catch (error) {
    console.error("Action fetchCollectionsAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch collections." } };
  }
};

export const fetchCategoriesAction = async () => {
  try {
    const res = await getCategoriesService();
    return res;
  } catch (error) {
    console.error("Action fetchCategoriesAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch categories." } };
  }
};

export const createCategoryAction = async (payload) => {
  try {
    const res = await createCategoryService(payload);
    return res;
  } catch (error) {
    console.error("Action createCategoryAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const fetchSubCategoriesAction = async () => {
  try {
    const res = await getSubCategoriesService();
    return res;
  } catch (error) {
    console.error("Action fetchSubCategoriesAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch sub categories." } };
  }
};

export const createSubCategoryAction = async (payload) => {
  try {
    const res = await createSubCategoryService(payload);
    return res;
  } catch (error) {
    console.error("Action createSubCategoryAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const fetchDiamondShapesAction = async () => {
  try {
    const res = await getDiamondShapesService();
    return res;
  } catch (error) {
    console.error("Action fetchDiamondShapesAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch diamond shapes." } };
  }
};

export const createDiamondShapeAction = async (payload) => {
  try {
    const res = await createDiamondShapeService(payload);
    return res;
  } catch (error) {
    console.error("Action createDiamondShapeAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const fetchColorsAction = async () => {
  try {
    const res = await getColorsService();
    return res;
  } catch (error) {
    console.error("Action fetchColorsAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch colors." } };
  }
};

export const createColorAction = async (payload) => {
  try {
    const res = await createColorService(payload);
    return res;
  } catch (error) {
    console.error("Action createColorAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const fetchRingSizesAction = async () => {
  try {
    const res = await getRingSizesService();
    return res;
  } catch (error) {
    console.error("Action fetchRingSizesAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch ring sizes." } };
  }
};

export const createRingSizeAction = async (payload) => {
  try {
    const res = await createRingSizeService(payload);
    return res;
  } catch (error) {
    console.error("Action createRingSizeAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const fetchPuritiesAction = async () => {
  try {
    const res = await getPuritiesService();
    return res;
  } catch (error) {
    console.error("Action fetchPuritiesAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch purities." } };
  }
};

export const createPurityAction = async (payload) => {
  try {
    const res = await createPurityService(payload);
    return res;
  } catch (error) {
    console.error("Action createPurityAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const fetchProductsAction = async () => {
  try {
    const res = await getProductsService();
    return res;
  } catch (error) {
    console.error("Action fetchProductsAction Error:", error);
    return { data: [], error: { message: error.message || "Failed to fetch products." } };
  }
};

export const createProductAction = async (payload) => {
  try {
    const res = await createProductService(payload);
    return res;
  } catch (error) {
    console.error("Action createProductAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const toggleProductActiveAction = async (productId, isActive) => {
  try {
    const res = await toggleProductActiveService(productId, isActive);
    return res;
  } catch (error) {
    console.error("Action toggleProductActiveAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to update status." } };
  }
};

export const updateProductAction = async (payload) => {
  try {
    const res = await updateProductService(payload);
    return res;
  } catch (error) {
    console.error("Action updateProductAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred during product update." } };
  }
};

export const deleteProductAction = async (productId) => {
  try {
    const res = await deleteProductService(productId);
    return res;
  } catch (error) {
    console.error("Action deleteProductAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to delete product." } };
  }
};

export const removeProductMediaAction = async (productId, colorId = null) => {
  try {
    const res = await removeProductMediaService(productId, colorId);
    return res;
  } catch (error) {
    console.error("Action removeProductMediaAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to remove product media." } };
  }
};