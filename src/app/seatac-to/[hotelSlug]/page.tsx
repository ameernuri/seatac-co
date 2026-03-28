import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HotelPageScreen } from "@/components/hotel-page-screen";
import { getHotelBySlug } from "@/lib/data";
import { env } from "@/env";
import { getHotelPageDescription, getHotelRouteName } from "@/lib/hotels";
import { getHotelStaySnapshot } from "@/lib/hotel-stays";
import { buildSeatacMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type HotelPageProps = {
  params: Promise<{
    hotelSlug: string;
  }>;
  searchParams: Promise<{
    checkin?: string;
    checkout?: string;
  }>;
};

export async function generateMetadata({ params }: HotelPageProps): Promise<Metadata> {
  const { hotelSlug } = await params;
  const hotel = await getHotelBySlug(hotelSlug, env.siteSlug);

  if (!hotel) {
    return buildSeatacMetadata({
      title: "Hotel transfer | seatac.co",
      description: "Hotel transfer page",
      path: "/seatac-airport-hotels",
      index: false,
    });
  }

  const staySnapshot = getHotelStaySnapshot(hotel);

  return buildSeatacMetadata({
    title: `${getHotelRouteName(hotel)} | seatac.co`,
    description: `${getHotelPageDescription(hotel)} Typical nightly rate ${staySnapshot.nightlyRateLabel}.`,
    path: `/seatac-to/${hotel.slug}`,
  });
}

export default async function SeatacToHotelPage({ params, searchParams }: HotelPageProps) {
  const { hotelSlug } = await params;
  const dates = await searchParams;
  const hotel = await getHotelBySlug(hotelSlug, env.siteSlug);

  if (!hotel) {
    notFound();
  }

  return <HotelPageScreen slug={hotelSlug} stayDates={dates} />;
}
