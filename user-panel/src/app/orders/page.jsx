import React from "react";
import OrdersClientPage from "./OrdersClientPage";
import { generatePageMetadata } from "@/utils/pageMeta";

export const metadata = generatePageMetadata({
  title: "My Orders & History",
  description: "Manage and track your fine jewelry orders and delivery status.",
  canonicalPath: "/orders",
  noIndex: true,
});

export default function OrdersPage() {
  return <OrdersClientPage />;
}
