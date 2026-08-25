import { fetchActiveProductsService } from "@/lib/productService";
import { siteUrl } from "@/utils/environment";

export default async function sitemap() {
  const baseUrl = siteUrl || "https://luxora-jewelery.vercel.app";

  // Static route paths
  const staticRoutes = [
    "",
    "/about-us",
    "/appointment",
    "/contact",
    "/custom-jewelry",
    "/collection",
    "/collection/jewellery",
    "/collection/wedding",
    "/privacy-policy",
    "/terms-and-conditions",
    "/returns-shipping",
    "/payment-and-financing",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Product routes
  let productRoutes = [];
  try {
    const res = await fetchActiveProductsService();
    if (res?.data && Array.isArray(res.data)) {
      productRoutes = res.data.map((product) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: 0.9,
      }));
    }
  } catch (err) {
    console.error("Sitemap product fetch error:", err);
  }

  return [...staticRoutes, ...productRoutes];
}
