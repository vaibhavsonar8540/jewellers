import React from "react";
import ProductClientPage from "./ProductClientPage";
import { productService } from "@/services/productService";
import { getProductMetadata } from "@/utils/pageMeta";
import { siteUrl } from "@/utils/environment";

export async function generateMetadata({ params }) {
  const resolvedParams = params ? await params : { id: "" };
  const productId = resolvedParams?.id;

  try {
    const { product } = await productService.fetchProductById(productId);
    return getProductMetadata(product);
  } catch (err) {
    return getProductMetadata({});
  }
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = params ? await params : { id: "" };
  const productId = resolvedParams?.id;

  let product = null;
  try {
    const res = await productService.fetchProductById(productId);
    product = res?.product;
  } catch (err) {
    // Ignore error, fallback handled by client component
  }

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.image || product.thumbnail,
        description:
          product.description ||
          `Shop ${product.name} handcrafted in gold & certified diamonds.`,
        sku: product.sku || product.id,
        brand: {
          "@type": "Brand",
          name: "Luxora Jewellers",
        },
        offers: {
          "@type": "Offer",
          price: product.price || product.selling_price || "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/product/${product.id}`,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductClientPage params={resolvedParams} />
    </>
  );
}
