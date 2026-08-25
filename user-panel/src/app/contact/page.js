import React from "react";
import ContactClient from "./ContactClient";
import { getContactMetadata } from "@/utils/pageMeta";

export const metadata = getContactMetadata();

export default function ContactPage() {
  return <ContactClient />;
}
