import { supabase } from "@/lib/db";

export const sortGoldColors = (colorList) => {
  if (!Array.isArray(colorList)) return colorList;

  const getPriority = (item) => {
    if (!item) return 4;
    const name = (
      typeof item === "string"
        ? item
        : item?.name || item?.gold_color || item?.color || item?.slug || item?.text || ""
    ).toLowerCase();

    if (name.includes("yellow")) return 1;
    if (name.includes("rose") || name.includes("pink")) return 2;
    if (name.includes("white") || name.includes("silver") || name.includes("platinum")) return 3;
    return 4;
  };

  return [...colorList].sort((a, b) => getPriority(a) - getPriority(b));
};

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

      const comboList = Array.isArray(prod.variation_combo) ? prod.variation_combo : [];
      const variationList = Array.isArray(prod.variation) ? prod.variation : [];

      // Main image thumbnail from DB columns, relational media, or variation_combo
      let mainImage = prod.image || prod.thumbnail || prodMedia[0]?.thumbnail || "";
      if (!mainImage && comboList.length > 0) {
        const comboWithThumb = comboList.find((c) => c.thumbnail || (Array.isArray(c.images) && c.images[0]));
        if (comboWithThumb) {
          mainImage = comboWithThumb.thumbnail || comboWithThumb.images[0];
        }
      }

      // Extracted Carats / Purities
      const caratsSet = new Set();
      prodVars.forEach((v) => {
        const val = puritiesMap[v.purity_id] || v.carat || v.purity;
        if (val) caratsSet.add(val);
      });
      comboList.forEach((c) => {
        if (c.karat) caratsSet.add(c.karat);
      });
      variationList.forEach((v) => {
        const title = (v.customize_type_title || v.title || "").toLowerCase();
        if (title.includes("karat") || title.includes("purity")) {
          (v.sub_types || []).forEach((s) => {
            if (s.text) caratsSet.add(s.text);
          });
        }
      });
      const carats = Array.from(caratsSet);

      // Extracted Metal Colors & Image Maps
      const colorMap = {};
      const colorImageMap = {};

      prodMedia.forEach((m) => {
        const cObj = colorsMap[m.color_id];
        if (cObj) {
          colorMap[cObj.id || cObj.name] = cObj;
        }
        if (m.color_id && (m.thumbnail || m.image_url)) {
          if (!colorImageMap[m.color_id]) {
            colorImageMap[m.color_id] = m.thumbnail || m.image_url;
          }
        }
      });

      comboList.forEach((c) => {
        const colorName = c.color || c.attributes?.["Gold Color"] || c.attributes?.["Color"];
        if (colorName) {
          if (!colorMap[colorName]) {
            colorMap[colorName] = {
              id: c.color_id || colorName,
              name: colorName,
              hex_code: c.hex || "#FFD700",
            };
          }
          if (c.thumbnail || (Array.isArray(c.images) && c.images[0])) {
            colorImageMap[c.color_id || colorName] = c.thumbnail || c.images[0];
          }
        }
      });

      variationList.forEach((v) => {
        const title = (v.customize_type_title || v.title || "").toLowerCase();
        if (title.includes("color")) {
          (v.sub_types || []).forEach((s) => {
            if (s.text && !colorMap[s.text]) {
              colorMap[s.text] = {
                id: s.id || s.text,
                name: s.text,
                hex_code: s.hex_code || "#FFD700",
              };
            }
          });
        }
      });

      const colorObjs = sortGoldColors(Object.values(colorMap));

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
        karats: carats,
        colors: colorObjs,
        colorImageMap,
        rawMedia: prodMedia,
        rawVariations: prodVars,
        variation: prod.variation || [],
        variation_combo: prod.variation_combo || [],
        created_at: prod.created_at,
      };
    });

    return {
      data: formatted,
      collections: collections || [],
      categories: categories || [],
      subCategories: subCategories || [],
      colors: sortGoldColors(colors || []),
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

/**
 * Fetch LATEST products dynamically filtered by collection name, slug, or ID.
 * First tries Supabase RPC function 'get_latest_products_by_collection', with automatic fallback.
 */
export async function fetchLatestProductsByCollectionService(collectionNameOrSlug = null, limit = 8) {
  try {
    // 1. Attempt Supabase RPC execution
    if (supabase) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc("get_latest_products_by_collection", {
        p_collection_name: collectionNameOrSlug || null,
        p_limit: limit || 8,
      });

      if (!rpcErr && rpcData && Array.isArray(rpcData)) {
        const formattedData = rpcData.map((p) => ({
          ...p,
          karats: p.carats || [],
        }));
        return {
          data: formattedData,
          collection: rpcData[0]?.collection_name ? { name: rpcData[0].collection_name, id: rpcData[0].collection_id } : null,
          error: null,
        };
      }
    }

    // 2. Client-side Query Fallback
    const { data: allProducts, collections, error } = await fetchActiveProductsService();
    if (error || !allProducts) {
      return { data: [], collection: null, error };
    }

    let filtered = allProducts;
    let targetCollection = null;

    if (collectionNameOrSlug && collectionNameOrSlug.toLowerCase() !== "all") {
      const searchTerm = collectionNameOrSlug.toLowerCase().trim();

      targetCollection = (collections || []).find(
        (c) =>
          c.id === collectionNameOrSlug ||
          (c.name && c.name.toLowerCase() === searchTerm) ||
          (c.slug && c.slug.toLowerCase() === searchTerm)
      );

      filtered = allProducts.filter((prod) => {
        const prodColName = (prod.collection_name || "").toLowerCase();
        const prodColSlug = (prod.collection_slug || "").toLowerCase();
        const prodColId = prod.collection_id;

        return (
          prodColId === collectionNameOrSlug ||
          prodColName === searchTerm ||
          prodColSlug === searchTerm ||
          prodColName.includes(searchTerm)
        );
      });
    }

    // Sort by created_at DESC (latest arrivals first)
    const latestProducts = filtered
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, limit);

    return {
      data: latestProducts,
      collection: targetCollection,
      error: null,
    };
  } catch (err) {
    console.error("fetchLatestProductsByCollectionService error:", err);
    return { data: [], collection: null, error: err };
  }
}

