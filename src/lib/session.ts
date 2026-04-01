import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { clientProfiles, sessions, users } from "@/db/schema";
import { env } from "@/env";

export async function getServerSession() {
  const requestHeaders = new Headers(await headers());
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (cookieHeader) {
    requestHeaders.set("cookie", cookieHeader);
  }

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (session?.user) {
    return session;
  }

  const rawSessionToken = cookieStore.get(`${env.betterAuthCookiePrefix}.session_token`)?.value;

  if (!rawSessionToken) {
    return null;
  }

  const token = rawSessionToken.split(".")[0];

  if (!token) {
    return null;
  }

  const [row] = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    session: row.session,
    user: row.user,
  };
}

export async function getClientProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}
