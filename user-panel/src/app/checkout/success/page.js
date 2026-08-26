import React from "react";
import OrderSuccessClientPage from "./OrderSuccessClientPage";
import { generatePageMetadata } from "@/utils/pageMeta";

export const metadata = generatePageMetadata({
  title: "Order Confirmation",
  description: "Thank you for your purchase from Luxora Jewellers.",
  canonicalPath: "/checkout/success",
  noIndex: true,
});

export default function OrderSuccessPage() {
  return <OrderSuccessClientPage />;
}
