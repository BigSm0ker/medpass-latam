import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedPass LATAM",
  description:
    "Paga la consulta en segundos y comparte solo lo que el médico necesita. " +
    "Pagos en USDC a través de Pollar, con consentimiento por campo.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
