/**
 * @file app/layout.tsx
 * @description Root layout with AuthProvider and metadata
 * @changelog
 * - 2024-12-11: Added AuthProvider and iConnect metadata
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iConnect CRM",
  description: "Constituent Relationship Management for Political Leaders",
  keywords: ["CRM", "Politics", "Constituents", "Engagement"],
  authors: [{ name: "iConnect Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
