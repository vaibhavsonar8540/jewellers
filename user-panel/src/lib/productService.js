import { supabase } from "@/lib/db";

/**
 * Fetch all ACTIVE products along with taxonomy maps for user panel.
 */
export async function fetchActiveProductsService() {
  try {
    const [
      { data: products, error: prodErr },
      { data: collections, error: colErr },
      { data: categories, error: catErr },
      { data: subCategories, error: subErr },
      { data: colors, error: colorErr },
      { data: purities, error: purityErr },
      { data: mediaMappings, error: mediaErr },
      { data: productVariations, error: varErr },
    ] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("collections").select("*").order("created_at", { ascending: true }),
      supabase.from("categories").select("*").order("created_at", { ascending: true }),
      supabase.from("sub_categories").select("*").order("created_at", { ascending: true }),
      supabase.from("colors").select("*").order("created_at", { ascending: true }),
      supabase.from("purity").select("*").order("carat", { ascending: true }),
      supabase.from("media_mapping").select("*"),
      supabase.from("product_variations").select("*"),
    ]);

    if (prodErr) {
      console.error("Error fetching active products:", prodErr);
      return { data: [], collections: [], categories: [], subCategories: [], colors: [], purities: [], error: prodErr };
    }

    // Build Lookup Maps
    const collectionsMap = {};
    (collections || []).forEach((c) => (collectionsMap[c.id] = c));

    const categoriesMap = {};
    (categories || []).forEach((c) => (categoriesMap[c.id] = c));

    const subCategoriesMap = {};
    (subCategories || []).forEach((s) => (subCategoriesMap[s.id] = s));

    const colorsMap = {};
    (colors || []).forEach((col) => (colorsMap[col.id] = col));

    const puritiesMap = {};
    (purities || []).forEach((p) => (puritiesMap[p.id] = p.carat || p.name || p.purity || p.value));

    // Group media mappings and variations by product_id
    const mediaByProd = {};
    (mediaMappings || []).forEach((m) => {
      if (!mediaByProd[m.product_id]) mediaByProd[m.product_id] = [];
      mediaByProd[m.product_id].push(m);
    });

    const variationsByProd = {};
    (productVariations || []).forEach((v) => {
      if (!variationsByProd[v.product_id]) variationsByProd[v.product_id] = [];
      variationsByProd[v.product_id].push(v);
    });

    const makeSlug = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, "-");

    // Format products for UI
    const formatted = (products || []).map((prod) => {
      const prodMedia = mediaByProd[prod.id] || [];
      const prodVars = variationsByProd[prod.id] || [];

      // Main image thumbnail
      const firstMedia = prodMedia[0];
      const mainImage = firstMedia?.thumbnail || prod.image || "";

      // Extracted Carats
      const carats = Array.from(
        new Set(
          prodVars
            .map((v) => puritiesMap[v.purity_id] || v.carat || v.purity)
            .filter(Boolean)
        )
      );

      // Extracted Metal Colors & Image Maps
      const colorMap = {};
      const colorImageMap = {};

      prodMedia.forEach((m) => {
        const cObj = colorsMap[m.color_id];
        if (cObj) {
          colorMap[cObj.id] = cObj;
        }
        if (m.color_id && (m.thumbnail || m.image_url)) {
          if (!colorImageMap[m.color_id]) {
            colorImageMap[m.color_id] = m.thumbnail || m.image_url;
          }
        }
      });
      const colorObjs = Object.values(colorMap);

      const colObj = collectionsMap[prod.collection_id];
      const catObj = categoriesMap[prod.category_id];
      const subObj = subCategoriesMap[prod.sub_category_id];

      const colName = colObj?.name || prod.collection || "";
      const catName = catObj?.name || prod.category || "";
      const subName = subObj?.name || prod.sub_category || "";

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug || makeSlug(prod.name),
        sku: prod.sku,
        description: prod.description,
        gender: prod.gender || null,
        is_active: prod.is_active ?? true,
        price: parseFloat(prod.price) || 0,
        stock: parseInt(prod.stock, 10) || 0,
        collection_id: prod.collection_id,
        collection_name: colName,
        collection_slug: colObj?.slug || makeSlug(colName),
        category_id: prod.category_id,
        category_name: catName,
        category_slug: catObj?.slug || makeSlug(catName),
        sub_category_id: prod.sub_category_id,
        sub_category_name: subName,
        sub_category_slug: subObj?.slug || makeSlug(subName),
        image: mainImage,
        carats,
        colors: colorObjs,
        colorImageMap,
        rawMedia: prodMedia,
        rawVariations: prodVars,
        created_at: prod.created_at,
      };
    });

    return {
      data: formatted,
      collections: collections || [],
      categories: categories || [],
      subCategories: subCategories || [],
      colors: colors || [],
      purities: purities || [],
      error: null,
    };
  } catch (err) {
    console.error("fetchActiveProductsService error:", err);
    return {
      data: [],
      collections: [],
      categories: [],
      subCategories: [],
      colors: [],
      purities: [],
      error: err,
    };
  }
}
