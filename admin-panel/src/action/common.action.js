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
  getKaratsService,
  createKaratService,
  getColorKaratsService,
  createColorKaratService,
  deleteColorKaratService,
  getProductsService,
  createProductService,
  toggleProductActiveService,
  updateProductService,
  deleteProductService,
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

export const fetchKaratsAction = async () => {
  try {
    const res = await getKaratsService();
    return res;
  } catch (error) {
    console.error("Action fetchKaratsAction Error:", error);
    return { data: null, error: { message: error.message || "Failed to fetch karat purities." } };
  }
};

export const fetchPuritiesAction = fetchKaratsAction;

export const createKaratAction = async (payload) => {
  try {
    const res = await createKaratService(payload);
    return res;
  } catch (error) {
    console.error("Action createKaratAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const createPurityAction = createKaratAction;

export const fetchColorKaratsAction = async (colorId = null) => {
  try {
    const res = await getColorKaratsService(colorId);
    return res;
  } catch (error) {
    console.error("Action fetchColorKaratsAction Error:", error);
    return { data: [], error: { message: error.message || "Failed to fetch color karats." } };
  }
};

export const createColorKaratAction = async (payload) => {
  try {
    const res = await createColorKaratService(payload);
    return res;
  } catch (error) {
    console.error("Action createColorKaratAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export const deleteColorKaratAction = async (payload) => {
  try {
    const res = await deleteColorKaratService(payload);
    return res;
  } catch (error) {
    console.error("Action deleteColorKaratAction Error:", error);
    return { data: null, error: { message: error.message || "An unexpected error occurred." } };
  }
};

export {
  fetchProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductActiveAction,
} from "./product.action";