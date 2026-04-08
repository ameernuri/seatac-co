import type { Metadata } from "next";

type BreadcrumbLink = {
  name: string;
  path: string;
};

type FaqEntry = {
  question: string;
  answer: string;
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
};

type ItemListEntry = {
  name: string;
  path: string;
};

type HotelLike = {
  name: string;
  address: string;
  summary: string;
};

const SITE_URL = "https://seatac.co";

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

export function buildSeatacMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "seatac.co",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbLink[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqJsonLd(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export function buildHotelJsonLd(
  hotel: HotelLike,
  path: string,
  image: string,
  priceRange?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    url: absoluteUrl(path),
    image: absoluteUrl(image),
    address: hotel.address,
    description: hotel.summary,
    ...(priceRange ? { priceRange } : {}),
  };
}

type ServiceInput = {
  name: string;
  description: string;
  path: string;
  price: number;
  areaServed: string[];
  providerPhone: string;
};

export function buildTransferServiceJsonLd({
  name,
  description,
  path,
  price,
  areaServed,
  providerPhone,
}: ServiceInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Airport transfer",
    name,
    description,
    url: absoluteUrl(path),
    areaServed,
    provider: {
      "@type": "LocalBusiness",
      name: "seatac.co",
      url: SITE_URL,
      telephone: providerPhone,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: price.toFixed(2),
      url: absoluteUrl(path),
    },
  };
}

export function buildCollectionPageJsonLd(
  name: string,
  description: string,
  path: string,
  items: ItemListEntry[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

export function buildLocalBusinessJsonLd(phone: string, email: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "seatac.co",
    url: SITE_URL,
    telephone: phone,
    email,
    description:
      "Sea-Tac airport travel planning with direct hotel, airline, cruise, and airport transfer booking information.",
    areaServed: [
      "Seattle-Tacoma International Airport",
      "SeaTac, Washington",
      "Seattle, Washington",
      "Bellevue, Washington",
      "Seattle waterfront",
    ],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "seatac.co",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/flight?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

type ArticleInput = {
  title: string;
  description: string;
  path: string;
  datePublished: Date | string | null | undefined;
  dateModified?: Date | string | null | undefined;
  authorName: string;
  image?: string | null;
};

export function buildArticleJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
  authorName,
  image,
}: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(path),
    datePublished: datePublished ? new Date(datePublished).toISOString() : undefined,
    dateModified: dateModified ? new Date(dateModified).toISOString() : undefined,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Seatac Connection",
      url: SITE_URL,
    },
    ...(image ? { image: absoluteUrl(image) } : {}),
  };
}
