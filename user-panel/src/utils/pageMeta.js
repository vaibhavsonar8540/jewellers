/**
 * Next.js App Router dynamic Metadata generator for SEO, OpenGraph, Twitter Cards, and canonical tags.
 */
import { siteUrl } from "./environment";
import {
  SITE_NAME,
  DEFAULT_META_TITLE,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
} from "./constant";

/**
 * Generate Next.js App Router compatible Metadata object.
 */
export function generatePageMetadata({
  title = DEFAULT_META_TITLE,
  description = DEFAULT_META_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath = "",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
} = {}) {
  const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`;

  return {
    title: pageTitle,
    description: description,
    keywords: Array.isArray(keywords) ? keywords.join(", ") : keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: pageTitle,
      description: description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: type,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description,
      images: [imageUrl],
    },
  };
}

/**
 * Preset SEO Metadata for Home Page
 */
export function getHomeMetadata() {
  return generatePageMetadata({
    title: "Jewellers | Luxury Fine Jewelry & Custom Designs",
    description:
      "Explore handcrafted luxury gold, certified diamond rings, wedding bands, and custom jewelry. Premium quality & lifetime warranty.",
    canonicalPath: "/",
  });
}

/**
 * Preset SEO Metadata for Collections / Shop Page
 */
export function getCollectionMetadata(collectionName = "", categoryName = "") {
  let title = "Fine Jewelry Collections";
  let description = "Browse handcrafted luxury gold and diamond jewelry collections.";

  if (collectionName && categoryName) {
    title = `${categoryName} - ${collectionName} Collection`;
    description = `Explore exquisite ${categoryName.toLowerCase()} in our ${collectionName} collection. Certified diamonds & pure gold designs.`;
  } else if (collectionName) {
    title = `${collectionName} Collection`;
    description = `Discover handcrafted ${collectionName.toLowerCase()} jewelry, featuring gold, certified diamonds, and precious gemstones.`;
  }

  const slugPath = collectionName
    ? `/collection/${collectionName.toLowerCase().replace(/\s+/g, "-")}`
    : "/collection";

  return generatePageMetadata({
    title,
    description,
    canonicalPath: slugPath,
  });
}

/**
 * Preset SEO Metadata for Product Details Page
 */
export function getProductMetadata(product = {}) {
  if (!product || !product.name) {
    return generatePageMetadata({
      title: "Product Details",
      description: "View luxury fine jewelry product details.",
    });
  }

  const title = `${product.name} - Luxury Gold & Diamond Jewelry`;
  const description =
    product.description ||
    `Shop ${product.name}. Handcrafted in premium gold with certified diamonds. Free shipping & lifetime warranty.`;
  const image = product.image || product.thumbnail || DEFAULT_OG_IMAGE;

  return generatePageMetadata({
    title,
    description,
    canonicalPath: `/product/${product.id}`,
    image,
    type: "product",
  });
}

/**
 * Preset SEO Metadata for Static Pages
 */
export function getAboutMetadata() {
  return generatePageMetadata({
    title: "About Us",
    description:
      "Learn about Jewellers heritage of fine craftsmanship, ethical diamonds, and bespoke jewelry design.",
    canonicalPath: "/about-us",
  });
}

export function getContactMetadata() {
  return generatePageMetadata({
    title: "Contact Us",
    description:
      "Get in touch with Jewellers customer care or visit our luxury jewelry boutique.",
    canonicalPath: "/contact",
  });
}

export function getAppointmentMetadata() {
  return generatePageMetadata({
    title: "Book a Private Appointment",
    description:
      "Schedule a personal consultation with our master jewelers for custom engagement rings and fine jewelry selection.",
    canonicalPath: "/appointment",
  });
}

export function getSitemapMetadata() {
  return generatePageMetadata({
    title: "HTML Sitemap - Luxora Jewellers Navigation Overview",
    description:
      "Explore the complete index of all pages, fine jewelry collections, categories, and custom design services at Luxora Jewellers.",
    canonicalPath: "/sitemap",
  });
}

