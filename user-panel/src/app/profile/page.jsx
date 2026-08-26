import React from "react";
import ProfileClientPage from "./ProfileClientPage";
import { generatePageMetadata } from "@/utils/pageMeta";

export const metadata = generatePageMetadata({
  title: "My Profile Account",
  description: "Manage your personal profile and default shipping address.",
  canonicalPath: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfileClientPage />;
}
