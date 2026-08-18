"use client";

import React from "react";
import PolicyLayout from "@/components/ui/PolicyLayout";

export default function PaymentAndFinancingPage() {
  const introParagraphs = [
    "At Luxora Jewellers, we offer flexible, secure, and convenient payment options to make acquiring fine jewellery seamless. Whether purchasing a signature diamond piece or a custom gold creation, choose from multiple payment methods designed for your confidence and ease.",
  ];

  const sections = [
    {
      heading: "1. Accepted Payment Methods",
      content:
        "All transactions are processed through 256-bit encrypted secure gateways to protect your financial security.",
      listTitle: "Supported Payment Options:",
      list: [
        "Credit Cards & Debit Cards (Visa, MasterCard, American Express, RuPay).",
        "Instant UPI Payments (Google Pay, PhonePe, Paytm, BHIM).",
        "Net Banking across 50+ major Indian banks.",
        "Digital Wallets & Bank Transfer options.",
      ],
    },
    {
      heading: "2. Flexible No-Cost EMI & Financing",
      content:
        "Experience effortless luxury with flexible 3, 6, 9, or 12-month EMI repayment options available directly at checkout.",
      list: [
        "Select Razorpay EMI at checkout.",
        "Choose your bank and preferred monthly installment plan.",
        "Instant bank authorization without additional documentation.",
      ],
    },
    {
      heading: "3. GST & Invoice Transparency",
      content:
        "All prices displayed on our website are inclusive of applicable Goods and Services Tax (GST 3%) as mandated by government regulations. A detailed GST invoice will accompany every shipment.",
    },
    {
      heading: "4. Payment Security & Verification",
      content:
        "To protect against fraud, high-value transactions may undergo secondary verification. We do not store credit card numbers or banking passwords on our servers.",
    },
  ];

  return (
    <PolicyLayout
      title="Payment and Financing"
      breadcrumbTitle="Payment and Financing"
      introParagraphs={introParagraphs}
      sections={sections}
    />
  );
}
