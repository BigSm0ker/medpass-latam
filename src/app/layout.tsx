import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedPass LATAM",
  description:
    "Paga la consulta en segundos y comparte solo lo que el médico necesita. " +
    "Pagos en USDC a través de Pollar, con consentimiento por campo.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  // `lang` starts as the default language and is updated by the provider once a
  // stored preference is read, so the server HTML and the first client render
  // agree. The metadata above stays Spanish: it is rendered on the server, where
  // the reader's choice is not yet known.
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
