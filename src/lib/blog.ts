import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { blogPosts, contentAuthors, sites } from "@/db/schema";
import { env } from "@/env";

export async function getPublishedBlogPosts(siteSlug = env.siteSlug) {
  const site = await db.query.sites.findFirst({
    where: eq(sites.slug, siteSlug),
  });

  if (!site) {
    return [];
  }

  const rows = await db
    .select({
      post: blogPosts,
      author: contentAuthors,
    })
    .from(blogPosts)
    .leftJoin(contentAuthors, eq(blogPosts.authorId, contentAuthors.id))
    .where(and(eq(blogPosts.siteId, site.id), eq(blogPosts.status, "published")))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.updatedAt));

  return rows.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

export async function getPublishedBlogPostBySlug(slug: string, siteSlug = env.siteSlug) {
  const site = await db.query.sites.findFirst({
    where: eq(sites.slug, siteSlug),
  });

  if (!site) {
    return null;
  }

  const [row] = await db
    .select({
      post: blogPosts,
      author: contentAuthors,
    })
    .from(blogPosts)
    .leftJoin(contentAuthors, eq(blogPosts.authorId, contentAuthors.id))
    .where(
      and(
        eq(blogPosts.siteId, site.id),
        eq(blogPosts.slug, slug),
        eq(blogPosts.status, "published"),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    ...row.post,
    author: row.author,
  };
}

export function renderBlogParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
