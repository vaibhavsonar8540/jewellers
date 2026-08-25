import { fetchActiveProductsService } from "@/lib/productService";
import { siteUrl } from "@/utils/environment";
import { supabase } from "@/lib/db";

const makeSlug = (str) =>
  (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default async function sitemap() {
  const baseUrl = (siteUrl || "https://luxora-jewelery.vercel.app").replace(/\/$/, "");
  const now = new Date().toISOString();

  // 1. Core Static Route Paths
  const staticPaths = [
    "",
    "/about-us",
    "/appointment",
    "/contact",
    "/custom-jewelry",
    "/collection",
    "/sitemap",
    "/privacy-policy",
    "/terms-and-conditions",
    "/returns-shipping",
    "/payment-and-financing",
  ];

  const urlMap = new Map();

  // Add static routes to Map
  staticPaths.forEach((path) => {
    urlMap.set(`${baseUrl}${path}`, {
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "daily" : path === "/collection" ? "daily" : "weekly",
      priority: path === "" ? 1.0 : path === "/collection" ? 0.9 : 0.8,
    });
  });

  try {
    // 2. Fetch active products, collections, categories, and subcategories
    const res = await fetchActiveProductsService();

    let collections = res?.collections || [];
    let categories = res?.categories || [];
    let subCategories = res?.subCategories || [];
    let products = res?.data || [];

    // Fallback: If productService returns empty taxonomy lists, query Supabase directly
    if (collections.length === 0 && supabase) {
      const { data: dbCols } = await supabase.from("collections").select("*");
      if (dbCols) collections = dbCols;
    }
    if (categories.length === 0 && supabase) {
      const { data: dbCats } = await supabase.from("categories").select("*");
      if (dbCats) categories = dbCats;
    }
    if (subCategories.length === 0 && supabase) {
      const { data: dbSubs } = await supabase.from("sub_categories").select("*");
      if (dbSubs) subCategories = dbSubs;
    }
    if (products.length === 0 && supabase) {
      const { data: dbProds } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);
      if (dbProds) products = dbProds;
    }

    // Build lookup maps for hierarchical relationship resolution
    const collectionsMap = {};
    collections.forEach((col) => {
      if (col.id) collectionsMap[col.id] = col;
      if (col.name) collectionsMap[col.name.toLowerCase().trim()] = col;
    });

    const categoriesMap = {};
    categories.forEach((cat) => {
      if (cat.id) categoriesMap[cat.id] = cat;
      if (cat.name) categoriesMap[cat.name.toLowerCase().trim()] = cat;
    });

    // A) Process Dynamic Collection URLs (/collection/:colSlug)
    collections.forEach((col) => {
      const colSlug = col.slug || makeSlug(col.name);
      if (colSlug) {
        const fullUrl = `${baseUrl}/collection/${colSlug}`;
        if (!urlMap.has(fullUrl)) {
          urlMap.set(fullUrl, {
            url: fullUrl,
            lastModified: col.updated_at || col.created_at || now,
            changeFrequency: "daily",
            priority: 0.85,
          });
        }
      }
    });

    // B) Process Dynamic Category URLs (/collection/:colSlug/:catSlug)
    categories.forEach((cat) => {
      const catSlug = cat.slug || makeSlug(cat.name);
      if (!catSlug) return;

      const parentCol =
        collectionsMap[cat.collection_id] ||
        collectionsMap[(cat.collection_name || "").toLowerCase().trim()];
      
      const colSlug = parentCol?.slug || makeSlug(parentCol?.name || cat.collection_name || "jewellery");
      const fullUrl = `${baseUrl}/collection/${colSlug}/${catSlug}`;

      if (!urlMap.has(fullUrl)) {
        urlMap.set(fullUrl, {
          url: fullUrl,
          lastModified: cat.updated_at || cat.created_at || now,
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    });

    // C) Process Dynamic Subcategory URLs (/collection/:colSlug/:catSlug/:subSlug)
    subCategories.forEach((sub) => {
      const subSlug = sub.slug || makeSlug(sub.name);
      if (!subSlug) return;

      const parentCat =
        categoriesMap[sub.category_id] ||
        categoriesMap[(sub.category_name || "").toLowerCase().trim()];
      
      const catSlug = parentCat?.slug || makeSlug(parentCat?.name || sub.category_name);

      const parentCol =
        parentCat
          ? collectionsMap[parentCat.collection_id] ||
            collectionsMap[(parentCat.collection_name || "").toLowerCase().trim()]
          : null;

      const colSlug = parentCol?.slug || makeSlug(parentCol?.name || "jewellery");

      const fullUrl = catSlug
        ? `${baseUrl}/collection/${colSlug}/${catSlug}/${subSlug}`
        : `${baseUrl}/collection/${colSlug}/${subSlug}`;

      if (!urlMap.has(fullUrl)) {
        urlMap.set(fullUrl, {
          url: fullUrl,
          lastModified: sub.updated_at || sub.created_at || now,
          changeFrequency: "daily",
          priority: 0.75,
        });
      }
    });

    // D) Process Dynamic Active Product URLs (/product/:id)
    products.forEach((product) => {
      const prodId = product.id || product.slug;
      if (!prodId) return;

      const fullUrl = `${baseUrl}/product/${prodId}`;
      if (!urlMap.has(fullUrl)) {
        urlMap.set(fullUrl, {
          url: fullUrl,
          lastModified: product.updated_at || product.created_at || now,
          changeFrequency: "daily",
          priority: 0.9,
        });
      }
    });

  } catch (err) {
    console.error("Sitemap generation error:", err);
  }

  return Array.from(urlMap.values());
}
