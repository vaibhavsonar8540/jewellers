import React from "react";
import CartClientPage from "./CartClientPage";
import { generatePageMetadata } from "@/utils/pageMeta";

export const metadata = generatePageMetadata({
  title: "Shopping Bag",
  description: "Review items in your luxury jewelry shopping bag.",
  canonicalPath: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartClientPage />;
}
