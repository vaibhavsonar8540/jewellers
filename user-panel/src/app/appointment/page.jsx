import React from "react";
import AppointmentClient from "./AppointmentClient";
import { getAppointmentMetadata } from "@/utils/pageMeta";

export const metadata = getAppointmentMetadata();

export default function AppointmentPage() {
  return <AppointmentClient />;
}
