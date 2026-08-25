/**
 * Environment configuration with fallback defaults for safe SSR and SEO operations.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined"
    ? window.location.origin
    : "https://jewellers.com");

export const siteName =
  process.env.NEXT_PUBLIC_SITE_NAME || "Jewellers Fine Jewelry";

export const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@jewellers.com";

export const contactPhone =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 98765 43210";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isProduction = process.env.NODE_ENV === "production";