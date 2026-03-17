import { redirect } from "next/navigation";

import { publicAdminUrl } from "@/lib/public-env";

function joinAdminUrl(slug: string[] | undefined) {
  const base = publicAdminUrl.replace(/\/$/, "");
  const suffix = slug && slug.length > 0 ? `/${slug.join("/")}` : "";

  return `${base}${suffix}`;
}

export default async function PublicAdminRedirectPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  redirect(joinAdminUrl(slug));
}
