import type { Metadata } from "next";
import { PassportScreen } from "./passport-screen";

export const metadata: Metadata = {
  title: "Pasaporte médico — MedPass LATAM",
  description: "Tu pasaporte médico, controlado por ti. Prototipo con datos ficticios.",
};

export default function PassportPage() {
  return <PassportScreen />;
}
