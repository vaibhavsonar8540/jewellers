import React from "react";
import CheckoutClientPage from "./CheckoutClientPage";
import { generatePageMetadata } from "@/utils/pageMeta";

export const metadata = generatePageMetadata({
  title: "Secure Checkout",
  description: "Complete your luxury jewelry order securely.",
  canonicalPath: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutClientPage />;
}
