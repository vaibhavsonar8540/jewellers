import { siteUrl } from "@/utils/environment";

export default function robots() {
  const baseUrl = siteUrl || "https://luxora-jewelery.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/checkout", "/orders", "/profile", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
