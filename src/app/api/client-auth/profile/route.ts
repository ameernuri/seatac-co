import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  clientVerificationPurposes,
  consumeVerifiedEmailToken,
  consumeVerifiedChallenge,
  consumeVerifiedPhoneToken,
  createClientSession,
  ensureClientUserAccount,
  getClientAccountSnapshot,
  getUserAccountBasics,
  upsertClientProfile,
} from "@/lib/client-auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { env } from "@/env";
import { normalizeClientPhone } from "@/lib/client-phone";
import { getClientProfileByUserId, getServerSession } from "@/lib/session";

const postBodySchema = z.object({
  challengeId: z.string().min(1).optional(),
  emailChallengeId: z.string().min(1).optional(),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  name: z.string().min(2),
  policyAgreed: z.boolean().default(false),
  phone: z.string().min(7),
  phoneChallengeId: z.string().min(1).optional(),
  phoneVerified: z.boolean().default(false),
  purpose: z.enum(clientVerificationPurposes).optional(),
  smsOptIn: z.boolean().default(false),
});

export async function GET() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ account: null });
  }

  const [accountSnapshot, profile] = await Promise.all([
    getClientAccountSnapshot(session.user.id).catch(() => null),
    getClientProfileByUserId(session.user.id).catch(() => null),
  ]);
  const sessionUser = session.user as typeof session.user & {
    phoneNumber?: string | null;
    phoneNumberVerified?: boolean | null;
  };
  const account = {
    userId: session.user.id,
    name: accountSnapshot?.name ?? session.user.name,
    email: accountSnapshot?.email ?? session.user.email,
    emailVerified: accountSnapshot?.emailVerified ?? session.user.emailVerified,
    phone: profile?.phone ?? accountSnapshot?.phone ?? sessionUser.phoneNumber ?? null,
    phoneVerifiedAt:
      profile?.phoneVerifiedAt ??
      accountSnapshot?.phoneVerifiedAt ??
      (sessionUser.phoneNumberVerified ? new Date(0) : null),
    policyAgreedAt: profile?.policyAgreedAt ?? accountSnapshot?.policyAgreedAt ?? null,
    smsOptIn: profile?.smsOptIn ?? accountSnapshot?.smsOptIn ?? false,
  };

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
        policyAgreed: payload.policyAgreed,
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

    const existingUser = await getUserAccountBasics(session.user.id);
    const existingProfile = await getClientProfileByUserId(session.user.id);

    if (!existingUser) {
      return NextResponse.json({ error: "Account could not be found." }, { status: 404 });
    }

    const normalizedExistingPhone = normalizeClientPhone(
      existingProfile?.phone ?? existingUser.phoneNumber ?? "",
    );
    const samePhone = normalizedExistingPhone === normalizedPhone;
    const sameEmail = existingUser.email.trim().toLowerCase() === payload.email.trim().toLowerCase();

    if (!samePhone && !payload.phoneVerified) {
      return NextResponse.json(
        { error: "Verify your mobile number before saving changes." },
        { status: 400 },
      );
    }

    if (!samePhone) {
      if (!payload.phoneChallengeId) {
        return NextResponse.json(
          { error: "Phone verification is required first." },
          { status: 400 },
        );
      }

      consumeVerifiedPhoneToken({
        challengeId: payload.phoneChallengeId,
        phone: payload.phone,
        purpose: "profile-update",
      });
    }

    if (!sameEmail && !payload.emailVerified) {
      return NextResponse.json(
        { error: "Verify your email before saving changes." },
        { status: 400 },
      );
    }

    if (!sameEmail) {
      if (!payload.emailChallengeId) {
        return NextResponse.json(
          { error: "Email verification is required first." },
          { status: 400 },
        );
      }

      consumeVerifiedEmailToken({
        challengeId: payload.emailChallengeId,
        email: payload.email,
        purpose: "profile-update",
      });
    }

    await db
      .update(users)
      .set({
        email: payload.email,
        emailVerified: sameEmail ? existingUser.emailVerified : payload.emailVerified,
        name: payload.name,
        phoneNumber: payload.phone,
        phoneNumberVerified: samePhone
          ? Boolean(existingUser.phoneNumberVerified || existingProfile?.phoneVerifiedAt)
          : payload.phoneVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    const profile = await upsertClientProfile({
      policyAgreed: payload.policyAgreed,
      phoneVerified: samePhone
        ? Boolean(existingProfile?.phoneVerifiedAt || existingUser.phoneNumberVerified)
        : payload.phoneVerified,
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
