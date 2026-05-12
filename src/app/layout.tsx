import type { Metadata } from "next";
import { Cal_Sans } from "next/font/google";

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

const googleAdsCallConversionLabel =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_CONVERSION_LABEL ?? "";

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
        <script
          id="google-phone-click-conversion"
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('click', function(event) {
                var target = event.target;
                var link = target && target.closest ? target.closest('a[href^="tel:"]') : null;

                if (!link || typeof window.gtag !== 'function') {
                  return;
                }

                var phoneNumber = link.href.replace(/^tel:/, '');
                var payload = {
                  event_category: 'lead',
                  event_label: phoneNumber,
                  phone_number: phoneNumber
                };

                window.gtag('event', 'click_to_call', payload);

                var adsConversionLabel = ${JSON.stringify(googleAdsCallConversionLabel)};
                if (adsConversionLabel) {
                  window.gtag('event', 'conversion', {
                    event_category: payload.event_category,
                    event_label: payload.event_label,
                    phone_number: payload.phone_number,
                    send_to: 'AW-18023510769/' + adsConversionLabel
                  });
                }
              }, true);
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
