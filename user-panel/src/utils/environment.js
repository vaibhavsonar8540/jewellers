/**
 * Environment configuration with fallback defaults for safe SSR and SEO operations.
 */
const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return "https://luxora-jewelery.vercel.app";
};

export const siteUrl = getSiteUrl();

export const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME || "Luxora Jewellers";

export const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@luxorajewellers.com";

export const contactPhone =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 98765 43210";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isProduction = process.env.NODE_ENV === "production";