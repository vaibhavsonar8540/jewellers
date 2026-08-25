import React from "react";
import ProductClientPage from "./ProductClientPage";
import { productService } from "@/services/productService";
import { getProductMetadata } from "@/utils/pageMeta";

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
  return <ProductClientPage params={resolvedParams} />;
}
