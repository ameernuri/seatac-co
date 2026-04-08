import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { clientProfiles, sessions, users } from "@/db/schema";
import { env } from "@/env";

export async function getServerSession() {
  try {
    const requestHeaders = new Headers(await headers());
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    if (cookieHeader) {
      requestHeaders.set("cookie", cookieHeader);
    }

    try {
      const session = await auth.api.getSession({
        headers: requestHeaders,
      });

      if (session?.user) {
        return session;
      }
    } catch {
      // Better Auth can fail here when auth tables drift behind the app
      // schema. Fall through to the direct session lookup below.
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
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          image: users.image,
          phoneNumber: users.phoneNumber,
          phoneNumberVerified: users.phoneNumberVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        },
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
  } catch {
    return null;
  }
}

export async function getClientProfileByUserId(userId: string) {
  const attempts = [
    async () => {
      const [profile] = await db
        .select({
          userId: clientProfiles.userId,
          phone: clientProfiles.phone,
          phoneNormalized: clientProfiles.phoneNormalized,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          smsOptIn: clientProfiles.smsOptIn,
          smsOptInAt: clientProfiles.smsOptInAt,
          policyAgreedAt: clientProfiles.policyAgreedAt,
          createdAt: clientProfiles.createdAt,
          updatedAt: clientProfiles.updatedAt,
        })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, userId))
        .limit(1);

      return profile ?? null;
    },
    async () => {
      const [profile] = await db
        .select({
          userId: clientProfiles.userId,
          phone: clientProfiles.phone,
          phoneNormalized: clientProfiles.phoneNormalized,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          smsOptIn: clientProfiles.smsOptIn,
          smsOptInAt: clientProfiles.smsOptInAt,
          createdAt: clientProfiles.createdAt,
          updatedAt: clientProfiles.updatedAt,
        })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, userId))
        .limit(1);

      return profile ? { ...profile, policyAgreedAt: null } : null;
    },
    async () => {
      const [profile] = await db
        .select({
          userId: clientProfiles.userId,
          phone: clientProfiles.phone,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          smsOptIn: clientProfiles.smsOptIn,
          smsOptInAt: clientProfiles.smsOptInAt,
          createdAt: clientProfiles.createdAt,
          updatedAt: clientProfiles.updatedAt,
        })
        .from(clientProfiles)
        .where(eq(clientProfiles.userId, userId))
        .limit(1);

      return profile
        ? { ...profile, phoneNormalized: null, policyAgreedAt: null }
        : null;
    },
  ] as const;

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
