import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPI MANAGER",
  description: "Gestion de stock d'Équipements de Protection Individuelle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} antialiased bg-[#F3F4F6] min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
