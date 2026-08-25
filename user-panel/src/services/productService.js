import { supabase } from "@/lib/db";
import { sortGoldColors } from "@/lib/productService";

/**
 * Service handling all Supabase queries for Product details and variations.
 */
export const productService = {
  /**
   * Fetches full product details including media mappings, variations, colors, purities, and sizes.
   */
  async fetchProductById(productId) {
    if (!productId || !supabase) {
      throw new Error("Invalid product ID or Supabase client.");
    }

    const [
      { data: prodData, error: prodErr },
      { data: mediaData },
      { data: colorData },
      { data: variationData },
      { data: purityData },
      { data: sizeData },
      { data: collectionsData },
      { data: categoriesData },
    ] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).single(),
      supabase.from("media_mapping").select("*").eq("product_id", productId),
      supabase.from("colors").select("*"),
      supabase.from("product_variations").select("*").eq("product_id", productId),
      supabase.from("purity").select("*"),
      supabase.from("ring_sizes").select("*"),
      supabase.from("collections").select("*"),
      supabase.from("categories").select("*"),
    ]);

    if (prodErr || !prodData) {
      throw new Error(prodErr?.message || "Product not found.");
    }

    // Resolve Collection and Category names & slugs
    const makeSlug = (str) =>
      (str || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

    let colObj = null;
    if (collectionsData && collectionsData.length > 0) {
      colObj = collectionsData.find(
        (c) =>
          c.id === prodData.collection_id ||
          c.id === prodData.collection ||
          (c.name && prodData.collection_name && c.name.toLowerCase() === prodData.collection_name.toLowerCase()) ||
          (c.name && prodData.collection && c.name.toLowerCase() === prodData.collection.toLowerCase())
      );
    }

    let catObj = null;
    if (categoriesData && categoriesData.length > 0) {
      catObj = categoriesData.find(
        (c) =>
          c.id === prodData.category_id ||
          c.id === prodData.category ||
          (c.name && prodData.category_name && c.name.toLowerCase() === prodData.category_name.toLowerCase()) ||
          (c.name && prodData.category && c.name.toLowerCase() === prodData.category.toLowerCase())
      );
    }

    const collectionName = colObj?.name || prodData.collection_name || prodData.collection || "";
    const collectionSlug = colObj?.slug || makeSlug(collectionName);
    const categoryName = catObj?.name || prodData.category_name || prodData.category || "";
    const categorySlug = catObj?.slug || makeSlug(categoryName);

    const enrichedProduct = {
      ...prodData,
      collection_name: collectionName,
      collection_slug: collectionSlug,
      category_name: categoryName,
      category_slug: categorySlug,
    };

    // Fetch Diamond Shape details if applicable
    let diamondShapeData = null;
    if (prodData.diamond_shape_id) {
      const { data: shapeData } = await supabase
        .from("diamond_shapes")
        .select("*")
        .eq("id", prodData.diamond_shape_id)
        .single();
      if (shapeData) diamondShapeData = shapeData;
    }

    // 1. Process Available Colors uploaded for this product
    const colorMap = {};
    (colorData || []).forEach((c) => (colorMap[c.id] = c));

    const uploadedColorIds = new Set([
      ...(mediaData || []).map((m) => m.color_id),
      ...(variationData || []).map((v) => v.color_id),
    ]);

    const availableColors = Array.from(uploadedColorIds)
      .map((id) => colorMap[id])
      .filter(Boolean);

    // 2. Process Available Purities uploaded for this product
    const purityMap = {};
    (purityData || []).forEach((p) => (purityMap[p.id] = p));

    const uploadedPurityIds = new Set(
      (variationData || []).map((v) => v.purity_id)
    );

    const availablePurities = Array.from(uploadedPurityIds)
      .map((id) => purityMap[id])
      .filter(Boolean);

    // 3. Process Dynamic Customizations from JSONB columns (variation & variation_combo)
    let dynamicColors = [];
    let dynamicPurities = [];
    let dynamicDiamondShapes = [];

    if (Array.isArray(prodData.variation)) {
      prodData.variation.forEach((v) => {
        const title = (v.customize_type_title || v.title || "").toLowerCase();
        if (title.includes("color")) {
          dynamicColors = (v.sub_types || []).map((s) => ({
            id: s.id,
            name: s.text,
            hex_code: s.hex_code || "#FFD700",
          }));
        } else if (title.includes("karat") || title.includes("purity")) {
          dynamicPurities = (v.sub_types || []).map((s) => ({
            id: s.id,
            carat: s.text,
            name: s.text,
          }));
        } else if (title.includes("diamond") || title.includes("shape")) {
          dynamicDiamondShapes = (v.sub_types || []).map((s) => ({
            id: s.id,
            name: s.text,
            img: s.img || null,
          }));
        }
      });
    }

    const finalColors = dynamicColors.length > 0 ? dynamicColors : availableColors;
    const finalPurities = dynamicPurities.length > 0 ? dynamicPurities : availablePurities;

    // 4. Process Ring Sizes
    let availableSizes = [];
    if (sizeData && sizeData.length > 0) {
      availableSizes = sizeData;
    } else if (prodData.size) {
      availableSizes = [{ id: "1", name: prodData.size }];
    }

    return {
      product: enrichedProduct,
      mediaList: mediaData || [],
      colors: sortGoldColors(finalColors),
      purities: finalPurities,
      ringSizes: availableSizes,
      diamondShape: diamondShapeData || (dynamicDiamondShapes.length > 0 ? dynamicDiamondShapes[0] : null),
      diamondShapes: dynamicDiamondShapes,
      variation: prodData.variation || [],
      variationCombo: prodData.variation_combo || [],
    };
  },
};
