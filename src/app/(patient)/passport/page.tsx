import type { Metadata } from "next";
import { PassportScreen } from "./passport-screen";

export const metadata: Metadata = {
  title: "Medical passport — MedPass LATAM",
  description: "A patient-controlled synthetic medical passport prototype.",
};

export default function PassportPage() {
  return <PassportScreen />;
}
