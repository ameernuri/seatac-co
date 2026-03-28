import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CruiseLinePageScreen } from "@/components/cruise-line-page-screen";
import { getCruiseLineGuide, getCruiseLineGuideSlugs } from "@/lib/cruise-lines";

type CruiseLineGuidePageProps = {
  params: Promise<{
    cruiseLineSlug: string;
  }>;
};

export async function generateStaticParams() {
  return getCruiseLineGuideSlugs().map((cruiseLineSlug) => ({ cruiseLineSlug }));
}

export async function generateMetadata({
  params,
}: CruiseLineGuidePageProps): Promise<Metadata> {
  const { cruiseLineSlug } = await params;
  const guide = getCruiseLineGuide(cruiseLineSlug);

  if (!guide) {
    return {
      title: "Seattle cruise line guide | seatac.co",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: guide.title,
    description: guide.description,
  };
}

export default async function CruiseLineGuidePage({
  params,
}: CruiseLineGuidePageProps) {
  const { cruiseLineSlug } = await params;
  const guide = getCruiseLineGuide(cruiseLineSlug);

  if (!guide) {
    notFound();
  }

  return <CruiseLinePageScreen slug={cruiseLineSlug} />;
}
