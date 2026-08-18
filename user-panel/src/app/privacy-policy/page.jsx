"use client";

import React from "react";
import PolicyLayout from "@/components/ui/PolicyLayout";

export default function PrivacyPolicyPage() {
  const introParagraphs = [
    "At Luxora Jewellers, we are committed to respecting your privacy and safeguarding your personal information. Whether you are visiting our website to browse or making a purchase, we want you to feel confident in how your data is handled. This Privacy Policy explains how we collect, use, share, and protect the information you provide through our website, and outlines your rights regarding that information.",
    "By accessing or using the Luxora Jewellers website, you agree to the terms of this Privacy Policy. If you do not agree with any aspect of our practices, we kindly ask that you refrain from using our website or submitting personal data.",
  ];

  const sections = [
    {
      heading: "1. Information We Collect",
      content:
        "We collect various types of information to provide you with an exceptional, personalized shopping experience and to fulfill your orders efficiently.",
      listTitle: "Personal Information may include:",
      list: [
        "Full Name, Billing Address, Shipping Address, and Contact Details (Phone & Email).",
        "Order history, bespoke ring sizes, gold karat selections, and customization preferences.",
        "Account authentication data when creating a user account.",
      ],
      extraContent:
        "Non-Personal Information may include IP address, browser type, geographic location based on IP, and browsing behavior to help us provide a secure and optimized shopping environment.",
    },
    {
      heading: "2. How We Use Your Information",
      content:
        "Your information is utilized solely to deliver superior service and process your luxury jewellery purchases.",
      listTitle: "Primary purposes include:",
      list: [
        "Processing, packaging, and shipping your fine jewellery orders.",
        "Sending order confirmations, hallmarking certificates, and transit tracking notifications.",
        "Scheduling in-person showroom appointments or virtual custom design consultations.",
        "Improving website functionality, product offerings, and customer service response times.",
      ],
    },
    {
      heading: "3. Sharing Information with Third Parties",
      content:
        "We strictly do not sell, rent, or trade your personal data. We only share information with trusted third-party service providers who assist in operating our website, conducting our business, or servicing your orders.",
      list: [
        "Authorized logistics and courier partners for secure, insured delivery.",
        "Accredited payment gateways (such as Razorpay) for encrypted payment processing.",
        "Legal authorities if required by applicable laws or to protect our rights and security.",
      ],
    },
    {
      heading: "4. Email Marketing and Communication Preferences",
      content:
        "With your consent, we may send you occasional emails regarding new collection launches, VIP preview events, or special promotions. You can opt out at any time by clicking the 'Unsubscribe' link at the bottom of any promotional email.",
    },
    {
      heading: "5. Cookies and Tracking Technologies",
      content:
        "We use cookies and similar tracking technologies to enhance your browsing experience, remember cart contents, and analyze web traffic patterns. You can choose to disable cookies through your browser settings, though some website features may not function as intended.",
    },
    {
      heading: "6. Data Security & Encryption",
      content:
        "We implement robust security measures, including 256-bit SSL encryption, Row Level Security (RLS) policies, and secure server hosting, to protect your personal information against unauthorized access, alteration, or disclosure.",
    },
    {
      heading: "7. Your Rights & Privacy Choices",
      content:
        "You have the right to access, update, or request the deletion of your personal data stored in our system. You can update your details at any time through the 'My Profile' section or by reaching out to our support team.",
    },
    {
      heading: "8. Contact Us",
      content:
        "If you have questions or concerns about this Privacy Policy or how your information is handled, please contact our Data Protection Officer at privacy@luxora.com or call our client assistance line at +91 1800-LUXORA.",
    },
  ];

  return (
    <PolicyLayout
      title="Privacy Policy"
      breadcrumbTitle="Privacy Policy"
      introParagraphs={introParagraphs}
      sections={sections}
    />
  );
}
