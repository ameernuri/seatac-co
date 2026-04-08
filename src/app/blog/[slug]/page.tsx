import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedBlogPostBySlug, renderBlogParagraphs } from "@/lib/blog";
import { buildArticleJsonLd, buildSeatacMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return buildSeatacMetadata({
      title: "Article not found | Seatac Connection",
      description: "The requested article is not available.",
      path: `/blog/${slug}`,
      index: false,
    });
  }

  return buildSeatacMetadata({
    title: post.seoTitle ?? `${post.title} | Seatac Connection`,
    description:
      post.seoDescription ??
      post.excerpt ??
      "Sea-Tac and Seattle travel planning guidance from Seatac Connection.",
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = renderBlogParagraphs(post.content);

  return (
    <div className="site-shell min-h-screen bg-[#f8f9fa]">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-28 lg:px-8">
        <JsonLd
          data={buildArticleJsonLd({
            title: post.title,
            description:
              post.seoDescription ??
              post.excerpt ??
              "Sea-Tac and Seattle travel planning guidance from Seatac Connection.",
            path: `/blog/${post.slug}`,
            datePublished: post.publishedAt ?? post.updatedAt,
            dateModified: post.updatedAt,
            authorName: post.author?.name ?? "Seatac Connection",
            image: post.coverImage ?? null,
          })}
        />
        <article className="rounded-[2rem] border border-emerald-100 bg-white px-8 py-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-emerald-600">
            <span>{post.category ?? "Guide"}</span>
            <span>{formatDate(post.publishedAt ?? post.updatedAt)}</span>
            {post.author?.name ? <span>{post.author.name}</span> : null}
          </div>
          <h1 className="mt-4 text-5xl font-extrabold tracking-[-0.04em] text-emerald-950">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 text-xl leading-9 text-slate-600">{post.excerpt}</p>
          ) : null}
          <div className="mt-10 space-y-6 text-lg leading-8 text-slate-700">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
