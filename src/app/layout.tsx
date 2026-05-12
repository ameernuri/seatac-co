import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";

import { PhoneClickTracker } from "@/components/phone-click-tracker";
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
  title: "Seatac Connection | Sea-Tac airport and cruise terminal rides",
  description:
    "Book private Sea-Tac airport rides, Seattle cruise terminal transfers, hotel pickups, Bellevue rides, Redmond trips, and Eastside car service.",
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
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18023510769"
        />
        <script
          id="google-tags"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = function(){window.dataLayer.push(arguments);}
              window.gtag('js', new Date());
              window.gtag('config', 'AW-18023510769');
              window.gtag('config', 'G-2NSD507P33');
            `,
          }}
        />
      </head>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
