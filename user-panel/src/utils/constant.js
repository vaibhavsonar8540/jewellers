/**
 * Central constants for branding, SEO, business info, and application defaults.
 */
import { siteUrl, contactEmail, contactPhone, siteName } from "./environment";

export const SITE_NAME = siteName;
export const SITE_TAGLINE = "Exquisite Handcrafted Gold & Diamond Jewelry";
export const DEFAULT_META_TITLE = "Luxora Jewellers | Premium Fine Jewelry & Custom Designs";
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
  "luxora jewelry",
];

export const COMPANY_INFO = {
  name: "Luxora Jewellers",
  legalName: "Luxora Luxury Fine Jewelry Ltd.",
  email: contactEmail,
  phone: contactPhone,
  address: "42 New Hartford Shopping Center, New Hartford, NY 13413",
  openingHours: "Mon - Sat: 10:00 AM - 8:00 PM",
};

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/luxorajewellers",
  facebook: "https://facebook.com/luxorajewellers",
  pinterest: "https://pinterest.com/luxorajewellers",
  twitter: "https://twitter.com/luxorajewellers",
};

export const DEFAULT_OG_IMAGE = `${siteUrl}/logo.webp`;
