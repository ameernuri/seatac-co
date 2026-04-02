import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  clientVerificationPurposes,
  consumeVerifiedChallenge,
  createClientSession,
  ensureClientUserAccount,
  getClientAccountSnapshot,
  upsertClientProfile,
  normalizeClientPhone,
} from "@/lib/client-auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { env } from "@/env";
import { getServerSession } from "@/lib/session";

const postBodySchema = z.object({
  challengeId: z.string().min(1).optional(),
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(7),
  purpose: z.enum(clientVerificationPurposes).optional(),
  smsOptIn: z.boolean().default(false),
});

export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ account: null });
  }

  const account = await getClientAccountSnapshot(session.user.id);

  return NextResponse.json({ account });
}

export async function POST(request: Request) {
  const session = await getServerSession();

  try {
    const payload = postBodySchema.parse(await request.json());
    const normalizedPhone = normalizeClientPhone(payload.phone);

    if (!normalizedPhone) {
      return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
    }

    if (!session?.user) {
      if (!payload.challengeId || !payload.purpose) {
        return NextResponse.json(
          { error: "Phone verification is required first." },
          { status: 401 },
        );
      }

      await consumeVerifiedChallenge({
        challengeId: payload.challengeId,
        phone: payload.phone,
        purpose: payload.purpose,
      });

      const { account, profile, userId, existed } = await ensureClientUserAccount({
        email: payload.email,
        name: payload.name,
        phone: payload.phone,
        smsOptIn: payload.smsOptIn,
      });
      const clientSession = await createClientSession({
        userId,
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: request.headers.get("user-agent"),
      });
      const response = NextResponse.json({ account, profile, existed });
      response.cookies.set(`${env.betterAuthCookiePrefix}.session_token`, clientSession.token, {
        expires: clientSession.expiresAt,
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: env.appUrl.startsWith("https://"),
      });
      return response;
    }

    await db
      .update(users)
      .set({
        email: payload.email,
        name: payload.name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    const profile = await upsertClientProfile({
      userId: session.user.id,
      phone: payload.phone,
      smsOptIn: payload.smsOptIn,
    });
    const account = await getClientAccountSnapshot(session.user.id);

    return NextResponse.json({ account, profile });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "That email or phone number is already used by another account." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Client profile could not be saved.",
      },
      { status: 400 },
    );
  }
}
