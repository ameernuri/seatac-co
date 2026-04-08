import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedBlogPosts } from "@/lib/blog";
import { buildSeatacMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildSeatacMetadata({
  title: "Seattle travel blog | Seatac Connection",
  description:
    "Guides, tips, and planning advice for Sea-Tac airport travel, Seattle hotels, parking, cruises, and airport transfers.",
  path: "/blog",
});

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Draft";
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="site-shell min-h-screen bg-[#f8f9fa]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-28 lg:px-8">
        <section className="rounded-[2rem] border border-emerald-100 bg-white px-8 py-10 shadow-sm">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-600">
            Seattle travel blog
          </p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-[-0.04em] text-emerald-950">
            Sea-Tac and Seattle travel guides for real trip planning.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Find practical advice on airport rides, parking, hotels, cruise transfers, flight timing,
            and getting around Seattle before and after your trip.
          </p>
        </section>

        <section className="mt-10 grid gap-6">
          {posts.length === 0 ? (
            <div className="rounded-[1.6rem] border border-emerald-100 bg-white px-6 py-8 text-slate-600 shadow-sm">
              New Seattle travel guides will appear here soon.
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-[1.6rem] border border-emerald-100 bg-white px-6 py-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-emerald-600">
                  <span>{post.category ?? "Guide"}</span>
                  <span>{formatDate(post.publishedAt ?? post.updatedAt)}</span>
                  {post.author?.name ? <span>{post.author.name}</span> : null}
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-emerald-950">
                  <Link href={`/blog/${post.slug}`} className="hover:text-emerald-700">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt ? (
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{post.excerpt}</p>
                ) : null}
                <div className="mt-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    Read article
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
