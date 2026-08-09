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

  // 1. If an image file is provided, upload it to Supabase Storage bucket 'luxora' inside folder 'collection'
  if (imageFile) {
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `collection/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("luxora")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      if (uploadError.message?.includes("row-level security") || uploadError.error?.includes("row-level security")) {
        return {
          data: null,
          error: {
            message: "Storage RLS Error: Supabase storage policy prevents uploading. Please apply the storage SQL policy in Supabase SQL Editor.",
          },
        };
      }
      return { data: null, error: uploadError };
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from("luxora")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData?.publicUrl || null;
  }

  // 2. Insert new row into 'collections' table
  const slug = createSlug(name);
  const { data, error } = await supabase
    .from("collections")
    .insert([
      {
        name,
        slug,
        image_url: imageUrl,
      },
    ])
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
      // Fallback plain select if join fails
      const { data: rawData, error: rawError } = await supabase
        .from("categories")
        .select("*");
      if (rawError) {
        console.error("getCategoriesService Error:", rawError);
        return { data: [], error: rawError };
      }
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
    if (collection_id) {
      payload.collection_id = collection_id;
    }

    const { data, error } = await supabase
      .from("categories")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase Categories Insert Error:", error);
      return { data: null, error };
    }

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
      if (rawError) {
        console.error("getSubCategoriesService Error:", rawError);
        return { data: [], error: rawError };
      }
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
    if (category_id) {
      payload.category_id = category_id;
    }

    const { data, error } = await supabase
      .from("sub_categories")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase Sub-Categories Insert Error:", error);
      return { data: null, error };
    }

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

    if (error) {
      console.error("Supabase Fetch Diamond Shapes Error:", error);
      return { data: [], error };
    }

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

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("luxora")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase
          .storage
          .from("luxora")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData?.publicUrl || null;
      } else {
        console.warn("Diamond shape storage upload warning:", uploadError);
      }
    }

    const slug = createSlug(name);
    const { data, error } = await supabase
      .from("diamond_shapes")
      .insert([
        {
          name,
          slug,
          image_url: imageUrl,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Diamond Shapes Insert Error:", error);
      return { data: null, error };
    }

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

    if (error) {
      console.error("Supabase Fetch Colors Error:", error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("getColorsService Error:", err);
    return { data: [], error: err };
  }
};

export const createColorService = async ({ name, hex_code }) => {
  try {
    const slug = createSlug(name);
    const payload = {
      name,
      slug,
      hex_code: hex_code || "#E5C158",
    };

    const { data, error } = await supabase
      .from("colors")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase Colors Insert Error:", error);
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

    if (error) {
      console.error("Supabase Fetch Ring Sizes Error:", error);
      return { data: [], error };
    }

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

    if (error) {
      console.error("Supabase Ring Sizes Insert Error:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("createRingSizeService Error:", err);
    return { data: null, error: err };
  }
};

// ----------------------------------------------------
// 7. PURITY SERVICE ('purity' table)
// ----------------------------------------------------
export const getPuritiesService = async () => {
  try {
    const { data, error } = await supabase
      .from("purity")
      .select("*")
      .order("carat", { ascending: true });

    if (error) {
      console.error("Supabase Fetch Purities Error:", error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("getPuritiesService Error:", err);
    return { data: [], error: err };
  }
};

export const createPurityService = async ({ carat, price }) => {
  try {
    const payload = {
      carat,
      price: parseFloat(price) || 0.00,
    };

    const { data, error } = await supabase
      .from("purity")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase Purity Insert Error:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error("createPurityService Error:", err);
    return { data: null, error: err };
  }
};
