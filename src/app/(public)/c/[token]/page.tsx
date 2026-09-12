import type { Metadata } from "next";
import { ConsentScreen } from "./consent-screen";

export const metadata: Metadata = {
  title: "Consultation request — MedPass LATAM",
  description:
    "Review what a provider is asking for, approve only what you choose, and pay.",
};

export default async function ConsentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ConsentScreen token={token} />;
}
