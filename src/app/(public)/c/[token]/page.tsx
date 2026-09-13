import type { Metadata } from "next";
import { ConsentScreen } from "./consent-screen";

export const metadata: Metadata = {
  title: "Solicitud de consulta — MedPass LATAM",
  description:
    "Revisa qué te está pidiendo el proveedor, aprueba solo lo que elijas, y paga.",
};

export default async function ConsentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ConsentScreen token={token} />;
}
