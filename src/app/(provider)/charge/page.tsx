import type { Metadata } from "next";
import { ChargeScreen } from "./charge-screen";

export const metadata: Metadata = {
  title: "New charge — MedPass LATAM",
  description: "Create a consultation charge and request only the context you need.",
};

export default function ChargePage() {
  return <ChargeScreen />;
}
