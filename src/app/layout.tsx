import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";
import Script from "next/script";

import { Providers } from "@/components/providers";
import "./globals.css";

const bodyFont = Cal_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "400",
});

const displayFont = Cal_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://seatac.co"),
  applicationName: "Seatac Connection",
  title: "Seatac Connection | Sea-Tac airport rides and travel planning",
  description:
    "Airport-first booking and travel planning for Sea-Tac pickups, Seattle hotel transfers, Bellevue rides, and local airport guides.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/seatac.co.icon.svg",
    shortcut: "/seatac.co.icon.svg",
    apple: "/seatac.co.icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18023510769"
          strategy="afterInteractive"
        />
        <Script id="google-tags" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18023510769');
            gtag('config', 'G-2NSD507P33');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
