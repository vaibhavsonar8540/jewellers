/**
 * SEO helper utilities for generating descriptive image alt attributes, hover titles,
 * and media metadata across products, collections, and marketing banners.
 */

/**
 * Clean text strings by removing extra spaces, trailing hyphens, and unwanted characters.
 */
export const cleanImageText = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/[^\w\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Format string to Title Case.
 */
export const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

/**
 * Generate SEO-optimized alt text for products, collections, and banners.
 *
 * @param {string} name - Product or item name (e.g., "Aurevia Marquise Crown Ring")
 * @param {string} [category] - Category name (e.g., "Rings")
 * @param {string} [collection] - Collection name (e.g., "Wedding Collection")
 * @param {string} [fallback] - Fallback text if name is missing
 * @returns {string} - Clean, SEO-optimized alt attribute text
 */
export const getSEOImageAlt = (
  name = "",
  category = "",
  collection = "",
  fallback = "Fine Jewelry Design"
) => {
  const cleanName = cleanImageText(name);
  const cleanCat = cleanImageText(category);
  const cleanCol = cleanImageText(collection);

  if (!cleanName && !cleanCat && !cleanCol) {
    return `${fallback} - Jewellers`;
  }

  const parts = [cleanName];
  if (cleanCat && !cleanName.toLowerCase().includes(cleanCat.toLowerCase())) {
    parts.push(cleanCat);
  }
  if (cleanCol && !cleanName.toLowerCase().includes(cleanCol.toLowerCase())) {
    parts.push(cleanCol);
  }

  parts.push("Jewellers");
  return parts.filter(Boolean).join(" | ");
};

/**
 * Generate user-friendly hover title text for images.
 */
export const getSEOImageTitle = (
  name = "",
  category = "",
  fallback = "Explore Fine Jewelry"
) => {
  const cleanName = cleanImageText(name);
  const cleanCat = cleanImageText(category);

  if (cleanName && cleanCat) {
    return `${toTitleCase(cleanName)} - ${toTitleCase(cleanCat)} Collection`;
  }
  if (cleanName) {
    return toTitleCase(cleanName);
  }
  return fallback;
};

/**
 * Convenience wrapper returning an object { alt, title } for Next Image or CustomImg components.
 */
export const formatImageMeta = ({
  name,
  category,
  collection,
  fallback = "Luxury Fine Jewelry",
} = {}) => {
  return {
    alt: getSEOImageAlt(name, category, collection, fallback),
    title: getSEOImageTitle(name, category, fallback),
  };
};
