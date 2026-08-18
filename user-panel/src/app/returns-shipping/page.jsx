"use client";

import React from "react";
import PolicyLayout from "@/components/ui/PolicyLayout";

export default function ReturnsAndShippingPage() {
  const introParagraphs = [
    "At Luxora Jewellers, we ensure every precious delivery is handled with extreme care, fully insured transit, and discreet packaging. Our 15-day return policy gives you total peace of mind when investing in fine jewellery.",
  ];

  const sections = [
    {
      heading: "1. Shipping & Insured Delivery",
      content:
        "Every shipment is 100% insured against loss or damage during transit until hand-delivered to your specified shipping address.",
      listTitle: "Shipping Highlights:",
      list: [
        "Complimentary Insured Shipping across India on all orders.",
        "Estimated delivery time: 3 to 7 business days.",
        "Discreet, tamper-evident luxury velvet gift boxes.",
        "OTP verification required upon delivery.",
      ],
    },
    {
      heading: "2. 15-Day Return Guarantee",
      content:
        "If you are not fully satisfied with your purchase, you may initiate a return within 15 days of receiving your item.",
      list: [
        "Items must be unworn, undamaged, with original security tags and certificates attached.",
        "Initiate returns directly from your 'My Orders' dashboard.",
        "Complimentary doorstep reverse pickup arranged by our courier partner.",
      ],
    },
    {
      heading: "3. Refund Process",
      content:
        "Once returned items pass quality verification at our vault, full refunds will be credited back to your original payment method within 5-7 business days.",
    },
    {
      heading: "4. Free Lifetime Resizing & Care",
      content:
        "We offer complimentary ring resizing within 1 size range, as well as lifetime ultrasonic cleaning and polishing across all Luxora boutiques.",
    },
  ];

  return (
    <PolicyLayout
      title="Returns & Shipping"
      breadcrumbTitle="Returns & Shipping"
      introParagraphs={introParagraphs}
      sections={sections}
    />
  );
}
