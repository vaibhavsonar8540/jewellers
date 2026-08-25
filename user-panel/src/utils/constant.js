/**
 * Central constants for branding, SEO, business info, and application defaults.
 */
import { siteUrl, contactEmail, contactPhone, siteName } from "./environment";

export const SITE_NAME = siteName;
export const SITE_TAGLINE = "Exquisite Handcrafted Gold & Diamond Jewelry";
export const DEFAULT_META_TITLE = "Jewellers | Premium Fine Jewelry & Custom Designs";
export const DEFAULT_META_DESCRIPTION =
  "Discover luxury handcrafted gold, certified diamond, and precious gemstone jewelry. Explore engagement rings, wedding bands, and custom jewelry collections.";

export const DEFAULT_KEYWORDS = [
  "fine jewelry",
  "diamond rings",
  "gold jewelry",
  "wedding bands",
  "engagement rings",
  "custom jewelry",
  "luxury necklaces",
  "gemstone jewelry",
  "solitaire rings",
  "handcrafted jewelry",
];

export const COMPANY_INFO = {
  name: "Jewellers",
  legalName: "Jewellers Luxury Fine Jewelry Ltd.",
  email: contactEmail,
  phone: contactPhone,
  address: "123 Diamond Avenue, Luxury District, Mumbai, Maharashtra 400001",
  openingHours: "Mon - Sat: 10:00 AM - 8:00 PM",
};

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/jewellers_fine",
  facebook: "https://facebook.com/jewellersfine",
  pinterest: "https://pinterest.com/jewellersfine",
  twitter: "https://twitter.com/jewellersfine",
};

export const DEFAULT_OG_IMAGE = `${siteUrl}/logo.webp`;
