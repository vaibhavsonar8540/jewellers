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
    ] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).single(),
      supabase.from("media_mapping").select("*").eq("product_id", productId),
      supabase.from("colors").select("*"),
      supabase.from("product_variations").select("*").eq("product_id", productId),
      supabase.from("purity").select("*"),
      supabase.from("ring_sizes").select("*"),
    ]);

    if (prodErr || !prodData) {
      throw new Error(prodErr?.message || "Product not found.");
    }

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
      product: prodData,
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
