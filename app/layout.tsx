import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carlos Vásquez — Escritorio",
  description: "Portafolio estilo IOS de Carlos Enrique Vásquez Colimilla",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
