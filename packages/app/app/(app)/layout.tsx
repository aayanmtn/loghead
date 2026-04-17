import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loghead",
  description: "Unified Logging, Simplified.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0b0f14] text-white`}>
        {children}
      </body>
    </html>
  );
}
