import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#000000" }],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.loghead.dev"),
  title: {
    default: "Loghead - The Modern CLI Log Viewer for Developers",
    template: "%s | Loghead",
  },
  description:
    "Pipe your logs to Loghead for instant, structured visibility. Supports logs from terminals, browsers, cloud tools. The zero-config terminal log viewer that helps you debug faster with AI insights.",
  keywords: [
    "logging",
    "log viewer",
    "cli tool",
    "developer tools",
    "observability",
    "structured logs",
    "json logs",
    "pretty print logs",
    "terminal logging",
    "debug logs",
    "local development",
    "go logging",
    "rust logging",
    "pipe logs",
  ],
  authors: [{ name: "Onvo AI" }],
  creator: "Onvo AI",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.loghead.dev",
    title: "Loghead - The Modern CLI Log Viewer for Developers",
    description:
      "Pipe your logs to Loghead for instant, structured visibility. The zero-config terminal log viewer that helps you debug faster with AI insights.",
    siteName: "Loghead",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loghead - The Modern CLI Log Viewer for Developers",
    description:
      "Pipe your logs to Loghead for instant, structured visibility. The zero-config terminal log viewer that helps you debug faster with AI insights.",
    creator: "@onvo_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          jetbrainsMono.variable,
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen bg-zinc-950">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Loghead",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Linux, macOS, Windows",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              description:
                "The Modern CLI Log Viewer for Developers. Pipe your logs to Loghead for instant, structured visibility.",
              softwareVersion: "1.0.0",
              author: {
                "@type": "Organization",
                name: "Onvo AI",
                url: "https://www.loghead.dev",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
