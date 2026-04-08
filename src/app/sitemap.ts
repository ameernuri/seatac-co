import type { MetadataRoute } from "next";

import { getCruiseLineGuideSlugs } from "@/lib/cruise-lines";
import { getCruiseTerminalGuideSlugs } from "@/lib/cruise-terminals";
import { getAirlineGuideSlugs } from "@/lib/airlines";
import { getPublishedBlogPosts } from "@/lib/blog";
import { getHotelClusterPageSlugs } from "@/lib/hotel-clusters";
import { getRoutePageSlugs } from "@/lib/route-pages";
import { seededSiteData } from "@/lib/seed-data";

const baseUrl = "https://seatac.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const hotels = seededSiteData.seatac_co.hotels;
  const blogPosts = await getPublishedBlogPosts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/reserve`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/flights`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/parking`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: `${baseUrl}/cruises`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.86,
    },
    {
      url: `${baseUrl}/arrivals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.86,
    },
    {
      url: `${baseUrl}/departures`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.86,
    },
    {
      url: `${baseUrl}/seatac-parking-guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${baseUrl}/seatac-airport-transfer-guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${baseUrl}/downtown-seattle-airport-transfer-guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.82,
    },
    {
      url: `${baseUrl}/pier-66-vs-pier-91-transfer-guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/park-and-fly-hotels-seatac`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/airlines`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.76,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.35,
    },
    {
      url: `${baseUrl}/sms-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.35,
    },
  ];

  const routePages: MetadataRoute.Sitemap = getRoutePageSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const hotelClusterPages: MetadataRoute.Sitemap = getHotelClusterPageSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.82,
  }));

  const airlineGuidePages: MetadataRoute.Sitemap = getAirlineGuideSlugs().map((slug) => ({
    url: `${baseUrl}/airlines/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.76,
  }));

  const cruiseTerminalPages: MetadataRoute.Sitemap = getCruiseTerminalGuideSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.82,
  }));

  const cruiseLinePages: MetadataRoute.Sitemap = getCruiseLineGuideSlugs().map((slug) => ({
    url: `${baseUrl}/cruise-lines/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.78,
  }));

  const hotelPages: MetadataRoute.Sitemap = hotels.map((hotel) => ({
    url: `${baseUrl}/seatac-to/${hotel.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.72,
  }));

  return [
    ...staticPages,
    ...routePages,
    ...hotelClusterPages,
    ...airlineGuidePages,
    ...cruiseTerminalPages,
    ...cruiseLinePages,
    ...hotelPages,
    ...blogPages,
  ];
}
