import React from "react";
import PolicyLayout from "@/components/ui/PolicyLayout";
import { generatePageMetadata } from "@/utils/pageMeta";

export const metadata = generatePageMetadata({
  title: "Terms & Conditions",
  description: "Review the terms and conditions of service for Luxora Jewellers.",
  canonicalPath: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  const introParagraphs = [
    "Welcome to Luxora Jewellers. These Terms and Conditions outline the rules and regulations for using our website and purchasing our handcrafted fine jewellery. By accessing or using our services, you accept and agree to be bound by these terms in full.",
    "If you disagree with any part of these Terms and Conditions, please refrain from using our website or placing orders with Luxora Jewellers.",
  ];

  const sections = [
    {
      heading: "1. Ownership & Intellectual Property",
      content:
        "All content, images, jewellery designs, logos, graphics, and text published on the Luxora Jewellers website are the exclusive property of Luxora Jewellers and protected by copyright and intellectual property laws.",
    },
    {
      heading: "2. Product Information & Metal Disclosures",
      content:
        "We strive to display our products, gold karats, purity levels, and diamond specifications as accurately as possible.",
      listTitle: "Gold & Gemstone Specifications:",
      list: [
        "All gold items are 100% BIS Hallmarked (14K, 18K, 22K) certified by government authorities.",
        "Due to the artisanal hand-crafting process, final gross weight may vary slightly (+/- 3%).",
        "Prices are calculated dynamically based on real-time gold market values.",
      ],
    },
    {
      heading: "3. Orders & Payment Terms",
      content:
        "Placing an order constitutes an offer to purchase specified jewellery. All orders are subject to acceptance and stock availability. Payments are processed securely via accredited payment gateways.",
    },
    {
      heading: "4. Custom Jewellery & Bespoke Orders",
      content:
        "Custom or personalized jewellery pieces made to specific client sizing or engraving requirements are non-refundable once manufacturing has commenced.",
    },
    {
      heading: "5. Limitation of Liability",
      content:
        "Luxora Jewellers shall not be liable for any indirect, incidental, or consequential damages resulting from website usage or product purchases beyond the total invoice amount paid.",
    },
    {
      heading: "6. Governing Law & Jurisdiction",
      content:
        "These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts.",
    },
  ];

  return (
    <PolicyLayout
      title="Terms & Conditions"
      breadcrumbTitle="Terms & Conditions"
      introParagraphs={introParagraphs}
      sections={sections}
    />
  );
}
