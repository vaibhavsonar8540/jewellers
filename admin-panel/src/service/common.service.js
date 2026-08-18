import { supabase } from "@/app/lib/db";

// Helper function to convert text into a URL-friendly slug
const createSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const isUUID = (str) =>
  typeof str === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

// ----------------------------------------------------
// 1. COLLECTIONS SERVICE ('collections' table)
// ----------------------------------------------------
export const getCollectionsService = async () => {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase Fetch Collections Error:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("getCollectionsService Error:", err);
    return { data: null, error: err };
  }
};

export const collectionService = async ({ name, imageFile }) => {
  let imageUrl = null;

  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `collection/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("luxora")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from("luxora")
        .getPublicUrl(filePath);
      imageUrl = publicUrlData?.publicUrl || null;
    }
  }

  const slug = createSlug(name);
  const { data, error } = await supabase
    .from("collections")
    .insert([{ name, slug, image_url: imageUrl }])
    .select();

  if (error) {
    console.error("Supabase Collection Insert Error:", error);
    return { data: null, error };
  }

  return { data, error: null };
};

// ----------------------------------------------------
// 2. CATEGORIES SERVICE ('categories' table)
// ----------------------------------------------------
export const getCategoriesService = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*, collections(*)")
      .order("created_at", { ascending: false });

    if (error) {
      const { data: rawData, error: rawError } = await supabase
        .from("categories")
        .select("*");
      if (rawError) return { data: [], error: rawError };
      return { data: rawData, error: null };
    }

    return { data, error: null };
  } catch (err) {
    console.error("getCategoriesService Error:", err);
    return { data: [], error: null };
  }
};

export const createCategoryService = async ({ name, collection_id }) => {
  try {
    const slug = createSlug(name);
    const payload = { name, slug };
    if (collection_id) payload.collection_id = collection_id;

    const { data, error } = await supabase
      .from("categories")
      .insert([payload])
      .select();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("createCategoryService Error:", err);
    return { data: null, error: err };
  }
};

// ----------------------------------------------------
// 3. SUB-CATEGORIES SERVICE ('sub_categories' table)
// ----------------------------------------------------
export const getSubCategoriesService = async () => {
  try {
    const { data, error } = await supabase
      .from("sub_categories")
      .select("*, categories(*)")
      .order("created_at", { ascending: false });

    if (error) {
      const { data: rawData, error: rawError } = await supabase
        .from("sub_categories")
        .select("*");
      if (rawError) return { data: [], error: rawError };
      return { data: rawData, error: null };
    }

    return { data, error: null };
  } catch (err) {
    console.error("getSubCategoriesService Error:", err);
    return { data: [], error: null };
  }
};

export const createSubCategoryService = async ({ name, category_id }) => {
  try {
    const slug = createSlug(name);
    const payload = { name, slug };
    if (category_id) payload.category_id = category_id;

    const { data, error } = await supabase
      .from("sub_categories")
      .insert([payload])
      .select();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("createSubCategoryService Error:", err);
    return { data: null, error: err };
  }
};

// ----------------------------------------------------
// 4. DIAMOND SHAPES SERVICE ('diamond_shapes' table)
// ----------------------------------------------------
export const getDiamondShapesService = async () => {
  try {
    const { data, error } = await supabase
      .from("diamond_shapes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error };
    return { data, error: null };
  } catch (err) {
    console.error("getDiamondShapesService Error:", err);
    return { data: [], error: err };
  }
};

export const createDiamondShapeService = async ({ name, imageFile }) => {
  try {
    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `diamond_shapes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("luxora")
        .upload(filePath, imageFile, { cacheControl: "3600", upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("luxora")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData?.publicUrl || null;
      }
    }

    const slug = createSlug(name);
    let payload = { name, slug, image: imageUrl };

    let { data, error } = await supabase
      .from("diamond_shapes")
      .insert([payload])
      .select();

    if (error && error.message && error.message.includes("slug")) {
      delete payload.slug;
      const res = await supabase.from("diamond_shapes").insert([payload]).select();
      data = res.data;
      error = res.error;
    }

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("createDiamondShapeService Error:", err);
    return { data: null, error: err };
  }
};

// ----------------------------------------------------
// 5. COLORS SERVICE ('colors' table)
// ----------------------------------------------------
export const getColorsService = async () => {
  try {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error };
    return { data, error: null };
  } catch (err) {
    console.error("getColorsService Error:", err);
    return { data: [], error: err };
  }
};

export const createColorService = async ({ name, hex_code }) => {
  try {
    const slug = createSlug(name);
    let payload = {
      name,
      hex_code: hex_code || "#D4AF37",
    };

    let { data, error } = await supabase
      .from("colors")
      .insert([payload])
      .select();

    if (error) {
      const errMsg = (error.message || "").toLowerCase();
      if (errMsg.includes("slug") && errMsg.includes("null")) {
        payload.slug = slug;
        const retry = await supabase.from("colors").insert([payload]).select();
        data = retry.data;
        error = retry.error;
      } else if (errMsg.includes("slug") && errMsg.includes("not find")) {
        delete payload.slug;
        const retry = await supabase.from("colors").insert([payload]).select();
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      console.error("createColorService Error:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("createColorService Error:", err);
    return { data: null, error: err };
  }
};

// ----------------------------------------------------
// 6. RING SIZES SERVICE ('ring_sizes' table)
// ----------------------------------------------------
export const getRingSizesService = async () => {
  try {
    const { data, error } = await supabase
      .from("ring_sizes")
      .select("*")
      .order("size_in_mm", { ascending: true });

    if (error) return { data: [], error };
    return { data, error: null };
  } catch (err) {
    console.error("getRingSizesService Error:", err);
    return { data: [], error: err };
  }
};

export const createRingSizeService = async ({ name, size_in_mm }) => {
  try {
    const payload = {
      name: name || `${size_in_mm} mm`,
      size_in_mm: parseFloat(size_in_mm),
    };

    const { data, error } = await supabase
      .from("ring_sizes")
      .insert([payload])
      .select();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("createRingSizeService Error:", err);
    return { data: null, error: err };
  }
};

// ----------------------------------------------------
// 7. KARATS SERVICE ('karats' table)
// ----------------------------------------------------
export const getKaratsService = async () => {
  try {
    const { data, error } = await supabase
      .from("karats")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      const { data: purityData, error: purityErr } = await supabase
        .from("purity")
        .select("*");
      if (!purityErr && purityData) {
        return { data: purityData.map((p) => ({ id: p.id, name: p.carat || p.name })), error: null };
      }
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("getKaratsService Error:", err);
    return { data: [], error: err };
  }
};

export const getPuritiesService = getKaratsService;

export const createKaratService = async ({ name, carat }) => {
  try {
    const karatName = (name || carat || "").trim().toUpperCase();
    const { data, error } = await supabase
      .from("karats")
      .insert([{ name: karatName }])
      .select();

    if (error) {
      const { data: purityData, error: purityErr } = await supabase
        .from("purity")
        .insert([{ carat: karatName, price: 0.00 }])
        .select();
      if (!purityErr && purityData) {
        return { data: purityData.map((p) => ({ id: p.id, name: p.carat })), error: null };
      }
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("createKaratService Error:", err);
    return { data: null, error: err };
  }
};

export const createPurityService = createKaratService;

// ----------------------------------------------------
// 8. COLOR KARATS RELATIONSHIP SERVICE ('color_karats' table)
// ----------------------------------------------------
export const getColorKaratsService = async (colorId = null) => {
  try {
    let query = supabase.from("color_karats").select("*, colors(*), karats(*)");
    if (colorId) {
      query = query.eq("color_id", colorId);
    }
    const { data, error } = await query;
    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    console.error("getColorKaratsService Error:", err);
    return { data: [], error: err };
  }
};

export const createColorKaratService = async ({ color_id, karat_id }) => {
  try {
    const { data, error } = await supabase
      .from("color_karats")
      .insert([{ color_id, karat_id }])
      .select();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("createColorKaratService Error:", err);
    return { data: null, error: err };
  }
};

export const deleteColorKaratService = async ({ color_id, karat_id }) => {
  try {
    const { data, error } = await supabase
      .from("color_karats")
      .delete()
      .eq("color_id", color_id)
      .eq("karat_id", karat_id);

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("deleteColorKaratService Error:", err);
    return { data: null, error: err };
  }
};

// ----------------------------------------------------
// 9. PRODUCTS SERVICE ('products', 'product_variations', 'media_mapping' tables)
// ----------------------------------------------------
export const getProductsService = async () => {
  try {
    const [
      { data: products, error: prodErr },
      { data: collections },
      { data: categories },
      { data: subCategories },
      { data: colors },
      { data: karats },
      { data: diamondShapes },
      { data: productVariations },
      { data: mediaMappings },
    ] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("collections").select("id, name"),
      supabase.from("categories").select("id, name"),
      supabase.from("sub_categories").select("id, name"),
      supabase.from("colors").select("id, name, hex_code"),
      supabase.from("karats").select("id, name"),
      supabase.from("diamond_shapes").select("id, name, slug, image"),
      supabase.from("product_variations").select("*"),
      supabase.from("media_mapping").select("*"),
    ]);

    if (prodErr) {
      console.error("Supabase Fetch Products Error:", prodErr);
      return { data: [], error: prodErr };
    }

    const collectionsMap = {};
    (collections || []).forEach((c) => (collectionsMap[c.id] = c.name));

    const categoriesMap = {};
    (categories || []).forEach((c) => (categoriesMap[c.id] = c.name));

    const subCategoriesMap = {};
    (subCategories || []).forEach((s) => (subCategoriesMap[s.id] = s.name));

    const colorsMap = {};
    (colors || []).forEach((col) => (colorsMap[col.id] = col));

    const karatsMap = {};
    (karats || []).forEach((k) => (karatsMap[k.id] = k.name));

    const diamondShapesMap = {};
    (diamondShapes || []).forEach((d) => (diamondShapesMap[d.id] = d));

    const variationsByProd = {};
    (productVariations || []).forEach((v) => {
      if (!variationsByProd[v.product_id]) variationsByProd[v.product_id] = [];
      variationsByProd[v.product_id].push(v);
    });

    const mediaByVariation = {};
    (mediaMappings || []).forEach((m) => {
      mediaByVariation[m.product_variation_id] = m;
    });

    const formattedProducts = (products || []).map((prod) => {
      const prodVars = variationsByProd[prod.id] || [];
      const comboList = Array.isArray(prod.variation_combo) ? prod.variation_combo : [];

      let mainImage = prod.image || prod.thumbnail || "";
      if (!mainImage && comboList.length > 0) {
        const comboWithThumb = comboList.find(
          (c) => c.media_mapping?.thumbnail || (Array.isArray(c.media_mapping?.images) && c.media_mapping.images[0])
        );
        if (comboWithThumb) {
          mainImage = comboWithThumb.media_mapping?.thumbnail || comboWithThumb.media_mapping?.images[0];
        }
      }

      const caratsSet = new Set();
      prodVars.forEach((v) => {
        const kName = karatsMap[v.karat_id];
        if (kName) caratsSet.add(kName);
      });
      comboList.forEach((c) => {
        if (c.gold_karat) caratsSet.add(c.gold_karat);
      });

      const colorsSet = new Set();
      prodVars.forEach((v) => {
        const colObj = colorsMap[v.color_id];
        if (colObj?.name) colorsSet.add(colObj.name);
      });
      comboList.forEach((c) => {
        if (c.gold_color) colorsSet.add(c.gold_color);
      });

      return {
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        collection_id: prod.collection_id,
        collection: collectionsMap[prod.collection_id] || "",
        category_id: prod.category_id,
        category: categoriesMap[prod.category_id] || "",
        sub_category_id: prod.sub_category_id,
        sub_category: subCategoriesMap[prod.sub_category_id] || "",
        gender: prod.gender || null,
        base_price: parseFloat(prod.base_price || prod.price) || 0.00,
        price: parseFloat(prod.base_price || prod.price) || 0.00,
        discount_percentage: parseFloat(prod.discount_percentage) || 0.00,
        stock: parseInt(prod.stock, 10) || 0,
        net_weight: prod.net_weight ? parseFloat(prod.net_weight) : null,
        gross_weight: prod.gross_weight ? parseFloat(prod.gross_weight) : null,
        diamond_weight: prod.diamond_weight ? parseFloat(prod.diamond_weight) : null,
        diamond_shape_id: prod.diamond_shape_id,
        diamond_shape: diamondShapesMap[prod.diamond_shape_id]?.name || "",
        is_active: prod.is_active ?? true,
        image: mainImage,
        carats: Array.from(caratsSet),
        colors: Array.from(colorsSet),
        variation_combo: comboList,
        product_variations: prodVars,
      };
    });

    return { data: formattedProducts, error: null };
  } catch (err) {
    console.error("getProductsService Error:", err);
    return { data: [], error: err };
  }
};

export const createProductService = async ({
  formData,
  variationsData = [],
}) => {
  try {
    if (!formData.collection_id || !isUUID(formData.collection_id)) {
      return {
        data: null,
        error: { message: "Please select a valid Collection from the database." },
      };
    }

    if (!formData.category_id || !isUUID(formData.category_id)) {
      return {
        data: null,
        error: { message: "Please select a valid Category from the database." },
      };
    }

    const generatedSlug = createSlug(formData.name);
    const skuCode = formData.sku && formData.sku.trim()
      ? formData.sku.trim()
      : `JW-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;

    let basePrice = parseFloat(formData.base_price || formData.price) || 0.00;
    let discountPct = parseFloat(formData.discount_percentage) || 0.00;
    let stockQty = parseInt(formData.stock, 10) || 0;

    let productPayload = {
      sku: skuCode,
      name: formData.name,
      slug: generatedSlug,
      description: formData.description || null,
      collection_id: formData.collection_id,
      category_id: formData.category_id,
      sub_category_id: isUUID(formData.sub_category_id) ? formData.sub_category_id : null,
      gender: formData.gender || null,
      base_price: basePrice,
      price: basePrice,
      discount_percentage: discountPct,
      stock: stockQty,
      net_weight: formData.net_weight ? parseFloat(formData.net_weight) : null,
      gross_weight: formData.gross_weight ? parseFloat(formData.gross_weight) : null,
      diamond_weight: formData.diamond_weight ? parseFloat(formData.diamond_weight) : null,
      diamond_shape_id: isUUID(formData.diamond_shape_id) ? formData.diamond_shape_id : null,
      is_active: formData.is_active ?? true,
      variation_combo: [],
    };

    let insertedProduct = null;
    let prodErr = null;
    let retryCount = 0;

    while (retryCount < 15) {
      const res = await supabase
        .from("products")
        .insert([productPayload])
        .select()
        .single();

      if (!res.error) {
        insertedProduct = res.data;
        prodErr = null;
        break;
      }

      prodErr = res.error;
      const errMsg = res.error.message || "";

      if (errMsg.toLowerCase().includes("sku")) {
        productPayload.sku = `JW-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
        retryCount++;
        continue;
      }

      if (errMsg.toLowerCase().includes("slug")) {
        productPayload.slug = `${generatedSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
        retryCount++;
        continue;
      }

      // Regex matches "Could not find the 'col_name' column"
      const missingColMatch = errMsg.match(/Could not find the '([^']+)' column/i);
      if (missingColMatch && missingColMatch[1]) {
        const missingCol = missingColMatch[1];
        if (missingCol === "base_price" && !productPayload.price) {
          productPayload.price = basePrice;
        }
        delete productPayload[missingCol];
        retryCount++;
        continue;
      }

      break;
    }

    if (prodErr || !insertedProduct) {
      console.error("Supabase Product Insert Error:", prodErr);
      return { data: null, error: prodErr };
    }

    const productId = insertedProduct.id;
    const variationComboSnapshot = [];

    for (let idx = 0; idx < variationsData.length; idx++) {
      const item = variationsData[idx];
      if (!item.color_id || !item.karat_id) continue;

      const { data: varData, error: varErr } = await supabase
        .from("product_variations")
        .insert([
          {
            product_id: productId,
            color_id: item.color_id,
            karat_id: item.karat_id,
          },
        ])
        .select()
        .single();

      if (varErr || !varData) {
        console.warn("Product variation insert warning:", varErr);
        continue;
      }

      const variationId = varData.id;
      const storageBasePath = `products/${productId}/variations/${variationId}`;

      let thumbUrl = item.media?.thumbnail || "";
      let imgUrls = item.media?.images || [];
      let videoUrl = item.media?.video || "";

      if (item.thumbnailFile) {
        const fileExt = item.thumbnailFile.name.split(".").pop();
        const path = `${storageBasePath}/thumbnail/thumb_${Date.now()}.${fileExt}`;
        const { error: upErr } = await supabase.storage.from("luxora").upload(path, item.thumbnailFile, { upsert: true });
        if (!upErr) {
          const { data: pubUrl } = supabase.storage.from("luxora").getPublicUrl(path);
          thumbUrl = pubUrl?.publicUrl || thumbUrl;
        }
      }

      if (item.imageFiles && item.imageFiles.length > 0) {
        const uploadedUrls = [];
        const filesToUpload = item.imageFiles.slice(0, 5);
        for (let imgIdx = 0; imgIdx < filesToUpload.length; imgIdx++) {
          const file = filesToUpload[imgIdx];
          const fileExt = file.name.split(".").pop();
          const path = `${storageBasePath}/images/img_${imgIdx}_${Date.now()}.${fileExt}`;
          const { error: upErr } = await supabase.storage.from("luxora").upload(path, file, { upsert: true });
          if (!upErr) {
            const { data: pubUrl } = supabase.storage.from("luxora").getPublicUrl(path);
            if (pubUrl?.publicUrl) uploadedUrls.push(pubUrl.publicUrl);
          }
        }
        if (uploadedUrls.length > 0) imgUrls = uploadedUrls;
      }

      if (item.videoFile) {
        const fileExt = item.videoFile.name.split(".").pop();
        const path = `${storageBasePath}/video/vid_${Date.now()}.${fileExt}`;
        const { error: upErr } = await supabase.storage.from("luxora").upload(path, item.videoFile, { upsert: true });
        if (!upErr) {
          const { data: pubUrl } = supabase.storage.from("luxora").getPublicUrl(path);
          videoUrl = pubUrl?.publicUrl || videoUrl;
        }
      }

      const finalImgUrls = (imgUrls || []).slice(0, 5);

      const { data: mediaData, error: mediaErr } = await supabase
        .from("media_mapping")
        .insert([
          {
            product_variation_id: variationId,
            thumbnail: thumbUrl,
            images: finalImgUrls,
            video: videoUrl,
          },
        ])
        .select()
        .single();

      if (mediaErr) {
        console.warn("Media mapping insert warning:", mediaErr);
      }

      variationComboSnapshot.push({
        color_id: item.color_id,
        karat_id: item.karat_id,
        gold_color: item.gold_color || "",
        gold_karat: item.gold_karat || "",
        product_variation_id: variationId,
        media_mapping_id: mediaData?.id || null,
        media_mapping: {
          thumbnail: thumbUrl,
          images: finalImgUrls,
          video: videoUrl,
        },
      });
    }

    if (variationComboSnapshot.length > 0) {
      try {
        await supabase
          .from("products")
          .update({ variation_combo: variationComboSnapshot, updated_at: new Date().toISOString() })
          .eq("id", productId);

        insertedProduct.variation_combo = variationComboSnapshot;
      } catch (e) {
        console.warn("Failed to update variation_combo snapshot on product:", e);
      }
    }

    return { data: insertedProduct, error: null };
  } catch (err) {
    console.error("createProductService Error:", err);
    return { data: null, error: err };
  }
};

export const updateProductService = async ({
  productId,
  formData,
  variationsData = [],
}) => {
  try {
    if (!productId || !isUUID(productId)) {
      return { data: null, error: { message: "Invalid Product ID provided for update." } };
    }

    let basePrice = parseFloat(formData.base_price || formData.price) || 0.00;
    let discountPct = parseFloat(formData.discount_percentage) || 0.00;
    let stockQty = parseInt(formData.stock, 10) || 0;

    let updatePayload = {
      name: formData.name,
      description: formData.description || null,
      collection_id: formData.collection_id,
      category_id: formData.category_id,
      sub_category_id: isUUID(formData.sub_category_id) ? formData.sub_category_id : null,
      gender: formData.gender || null,
      base_price: basePrice,
      price: basePrice,
      discount_percentage: discountPct,
      stock: stockQty,
      net_weight: formData.net_weight ? parseFloat(formData.net_weight) : null,
      gross_weight: formData.gross_weight ? parseFloat(formData.gross_weight) : null,
      diamond_weight: formData.diamond_weight ? parseFloat(formData.diamond_weight) : null,
      diamond_shape_id: isUUID(formData.diamond_shape_id) ? formData.diamond_shape_id : null,
      is_active: formData.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    let updatedProduct = null;
    let updateErr = null;
    let retryCount = 0;

    while (retryCount < 15) {
      const res = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", productId)
        .select()
        .single();

      if (!res.error) {
        updatedProduct = res.data;
        updateErr = null;
        break;
      }

      updateErr = res.error;
      const errMsg = res.error.message || "";

      const missingColMatch = errMsg.match(/Could not find the '([^']+)' column/i);
      if (missingColMatch && missingColMatch[1]) {
        const missingCol = missingColMatch[1];
        if (missingCol === "base_price" && !updatePayload.price) {
          updatePayload.price = basePrice;
        }
        delete updatePayload[missingCol];
        retryCount++;
        continue;
      }

      break;
    }

    if (updateErr) return { data: null, error: updateErr };

    if (variationsData && variationsData.length > 0) {
      await supabase.from("product_variations").delete().eq("product_id", productId);

      const variationComboSnapshot = [];

      for (let idx = 0; idx < variationsData.length; idx++) {
        const item = variationsData[idx];
        if (!item.color_id || !item.karat_id) continue;

        const { data: varData } = await supabase
          .from("product_variations")
          .insert([{ product_id: productId, color_id: item.color_id, karat_id: item.karat_id }])
          .select()
          .single();

        if (!varData) continue;

        const variationId = varData.id;
        const storageBasePath = `products/${productId}/variations/${variationId}`;

        let thumbUrl = item.media?.thumbnail || "";
        let imgUrls = item.media?.images || [];
        let videoUrl = item.media?.video || "";

        if (item.thumbnailFile) {
          const fileExt = item.thumbnailFile.name.split(".").pop();
          const path = `${storageBasePath}/thumbnail/thumb_${Date.now()}.${fileExt}`;
          const { error: upErr } = await supabase.storage.from("luxora").upload(path, item.thumbnailFile, { upsert: true });
          if (!upErr) {
            const { data: pubUrl } = supabase.storage.from("luxora").getPublicUrl(path);
            thumbUrl = pubUrl?.publicUrl || thumbUrl;
          }
        }

        if (item.imageFiles && item.imageFiles.length > 0) {
          const uploadedUrls = [];
          const filesToUpload = item.imageFiles.slice(0, 5);
          for (let imgIdx = 0; imgIdx < filesToUpload.length; imgIdx++) {
            const file = filesToUpload[imgIdx];
            const fileExt = file.name.split(".").pop();
            const path = `${storageBasePath}/images/img_${imgIdx}_${Date.now()}.${fileExt}`;
            const { error: upErr } = await supabase.storage.from("luxora").upload(path, file, { upsert: true });
            if (!upErr) {
              const { data: pubUrl } = supabase.storage.from("luxora").getPublicUrl(path);
              if (pubUrl?.publicUrl) uploadedUrls.push(pubUrl.publicUrl);
            }
          }
          if (uploadedUrls.length > 0) imgUrls = uploadedUrls;
        }

        if (item.videoFile) {
          const fileExt = item.videoFile.name.split(".").pop();
          const path = `${storageBasePath}/video/vid_${Date.now()}.${fileExt}`;
          const { error: upErr } = await supabase.storage.from("luxora").upload(path, item.videoFile, { upsert: true });
          if (!upErr) {
            const { data: pubUrl } = supabase.storage.from("luxora").getPublicUrl(path);
            videoUrl = pubUrl?.publicUrl || videoUrl;
          }
        }

        const finalImgUrls = (imgUrls || []).slice(0, 5);

        const { data: mediaData } = await supabase
          .from("media_mapping")
          .insert([
            {
              product_variation_id: variationId,
              thumbnail: thumbUrl,
              images: finalImgUrls,
              video: videoUrl,
            },
          ])
          .select()
          .single();

        variationComboSnapshot.push({
          color_id: item.color_id,
          karat_id: item.karat_id,
          gold_color: item.gold_color || "",
          gold_karat: item.gold_karat || "",
          product_variation_id: variationId,
          media_mapping_id: mediaData?.id || null,
          media_mapping: {
            thumbnail: thumbUrl,
            images: finalImgUrls,
            video: videoUrl,
          },
        });
      }

      if (variationComboSnapshot.length > 0) {
        try {
          await supabase
            .from("products")
            .update({ variation_combo: variationComboSnapshot, updated_at: new Date().toISOString() })
            .eq("id", productId);

          updatedProduct.variation_combo = variationComboSnapshot;
        } catch (e) {
          console.warn("Failed to update variation_combo snapshot on product:", e);
        }
      }
    }

    return { data: updatedProduct, error: null };
  } catch (err) {
    console.error("updateProductService Error:", err);
    return { data: null, error: err };
  }
};

export const deleteProductService = async (productId) => {
  try {
    if (!productId || !isUUID(productId)) {
      return { data: null, error: { message: "Invalid Product ID." } };
    }

    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("deleteProductService Error:", err);
    return { data: null, error: err };
  }
};

export const toggleProductActiveService = async ({ id, is_active }) => {
  try {
    if (!id || !isUUID(id)) {
      return { data: null, error: { message: "Invalid Product ID." } };
    }

    const { data, error } = await supabase
      .from("products")
      .update({ is_active: !!is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    console.error("toggleProductActiveService Error:", err);
    return { data: null, error: err };
  }
};
