import React from "react";
import PaymentClientPage from "./PaymentClientPage";
import { generatePageMetadata } from "@/utils/pageMeta";

export const metadata = generatePageMetadata({
  title: "Payment Options",
  description: "Select secure payment option for your fine jewelry order.",
  canonicalPath: "/payment",
  noIndex: true,
});

export default function PaymentPage() {
  return <PaymentClientPage />;
}
