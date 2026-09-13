import type { Metadata } from "next";
import { ChargeScreen } from "./charge-screen";

export const metadata: Metadata = {
  title: "Nuevo cobro — MedPass LATAM",
  description:
    "Crea un cobro de consulta y pide solo el contexto de salud que necesitas.",
};

export default function ChargePage() {
  return <ChargeScreen />;
}
