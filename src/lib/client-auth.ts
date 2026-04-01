import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { and, eq, isNull, or } from "drizzle-orm";

import { db } from "@/db/client";
import {
  clientPhoneVerificationChallenges,
  clientProfiles,
  users,
} from "@/db/schema";
import { env } from "@/env";
import { auth } from "@/lib/auth";
import {
  checkPhoneVerificationCode,
  getOtpSmsSenderConfig,
  isSmsConfigured,
  isTwilioVerifyConfigured,
  normalizePhoneNumber,
  sendPhoneVerificationCode,
  sendTextMessage,
} from "@/lib/sms";

export const clientVerificationPurposes = ["sign-up", "reserve-account"] as const;
export type ClientVerificationPurpose = (typeof clientVerificationPurposes)[number];

const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_TTL_MINUTES = 10;
const MAX_VERIFICATION_ATTEMPTS = 5;

export function hashVerificationCode(code: string) {
  return createHash("sha256")
    .update(`${env.betterAuthSecret}:${code}`)
    .digest("hex");
}

export function generateVerificationCode() {
  return String(randomInt(0, 10 ** VERIFICATION_CODE_LENGTH)).padStart(
    VERIFICATION_CODE_LENGTH,
    "0",
  );
}

export function normalizeClientPhone(input: string) {
  return normalizePhoneNumber(input);
}

export async function createPhoneVerificationChallenge(input: {
  phone: string;
  purpose: ClientVerificationPurpose;
}) {
  const phoneNormalized = normalizeClientPhone(input.phone);

  if (!phoneNormalized) {
    throw new Error("Enter a valid mobile number.");
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60 * 1000);
  const now = new Date();

  const [challenge] = await db
    .insert(clientPhoneVerificationChallenges)
    .values({
      id: randomUUID(),
      purpose: input.purpose,
      phoneNormalized,
      codeHash: hashVerificationCode(code),
      expiresAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (getOtpSmsSenderConfig().value) {
    await sendTextMessage({
      to: phoneNormalized,
      sender: getOtpSmsSenderConfig(),
      body: `seatac.co verification code: ${code}. This code expires in ${VERIFICATION_TTL_MINUTES} minutes.`,
    });
  } else if (isTwilioVerifyConfigured()) {
    await sendPhoneVerificationCode(phoneNormalized);
  } else if (isSmsConfigured()) {
    await sendTextMessage({
      to: phoneNormalized,
      body: `seatac.co verification code: ${code}. This code expires in ${VERIFICATION_TTL_MINUTES} minutes.`,
    });
  }

  return {
    challenge,
    developmentCode:
      process.env.NODE_ENV === "production" ||
      isSmsConfigured() ||
      isTwilioVerifyConfigured()
        ? undefined
        : code,
  };
}

export async function verifyPhoneVerificationChallenge(input: {
  challengeId: string;
  code: string;
  phone: string;
  purpose: ClientVerificationPurpose;
}) {
  const phoneNormalized = normalizeClientPhone(input.phone);

  if (!phoneNormalized) {
    throw new Error("Enter a valid mobile number.");
  }

  const [challenge] = await db
    .select()
    .from(clientPhoneVerificationChallenges)
    .where(
      and(
        eq(clientPhoneVerificationChallenges.id, input.challengeId),
        eq(clientPhoneVerificationChallenges.phoneNormalized, phoneNormalized),
        eq(clientPhoneVerificationChallenges.purpose, input.purpose),
        isNull(clientPhoneVerificationChallenges.consumedAt),
      ),
    )
    .limit(1);

  if (!challenge) {
    throw new Error("Verification session could not be found.");
  }

  if (challenge.verifiedAt) {
    return challenge;
  }

  if (challenge.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    throw new Error("Too many attempts. Request a new code.");
  }

  if (challenge.expiresAt <= new Date()) {
    throw new Error("That code has expired. Request a new one.");
  }

  const localCodeMatches = challenge.codeHash === hashVerificationCode(input.code);
  const usesDirectOtpSender = Boolean(getOtpSmsSenderConfig().value);

  if (usesDirectOtpSender) {
    if (!localCodeMatches) {
      await db
        .update(clientPhoneVerificationChallenges)
        .set({
          attempts: challenge.attempts + 1,
          updatedAt: new Date(),
        })
        .where(eq(clientPhoneVerificationChallenges.id, challenge.id));

      throw new Error("That code is not correct.");
    }
  } else if (isTwilioVerifyConfigured()) {
    const result = await checkPhoneVerificationCode({
      code: input.code,
      to: phoneNormalized,
    });

    if (result.status !== "approved") {
      await db
        .update(clientPhoneVerificationChallenges)
        .set({
          attempts: challenge.attempts + 1,
          updatedAt: new Date(),
        })
        .where(eq(clientPhoneVerificationChallenges.id, challenge.id));

      throw new Error("That code is not correct.");
    }
  } else if (!localCodeMatches) {
    await db
      .update(clientPhoneVerificationChallenges)
      .set({
        attempts: challenge.attempts + 1,
        updatedAt: new Date(),
      })
      .where(eq(clientPhoneVerificationChallenges.id, challenge.id));

    throw new Error("That code is not correct.");
  }

  const [verified] = await db
    .update(clientPhoneVerificationChallenges)
    .set({
      attempts: challenge.attempts + 1,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientPhoneVerificationChallenges.id, challenge.id))
    .returning();

  return verified;
}

export async function ensureClientUserAccount(input: {
  email: string;
  name: string;
  phone: string;
  smsOptIn: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const phoneNormalized = normalizeClientPhone(input.phone);

  if (!email) {
    throw new Error("Enter a valid email.");
  }

  if (!name || name.length < 2) {
    throw new Error("Enter your full name.");
  }

  if (!phoneNormalized) {
    throw new Error("Enter a valid mobile number.");
  }

  const [existingByEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const [existingByPhone] = await db
    .select()
    .from(users)
    .where(eq(users.phoneNumber, phoneNormalized))
    .limit(1);

  if (
    existingByEmail &&
    existingByPhone &&
    existingByEmail.id !== existingByPhone.id
  ) {
    throw new Error(
      "That email or mobile number is already used by another account.",
    );
  }

  let user = existingByPhone ?? existingByEmail ?? null;

  if (!user) {
    const generatedPassword = `${randomBytes(16).toString("hex")}Aa1!`;

    try {
      await auth.api.signUpEmail({
        body: {
          email,
          name,
          password: generatedPassword,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Account could not be created.";

      if (!/already exists/i.test(message)) {
        throw error;
      }
    }

    const [createdUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    user = createdUser ?? null;

    if (!user) {
      throw new Error("Account could not be created.");
    }
  }

  await db
    .update(users)
    .set({
      email,
      name,
      phoneNumber: phoneNormalized,
      phoneNumberVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const profile = await upsertClientProfile({
    userId: user.id,
    phone: input.phone,
    smsOptIn: input.smsOptIn,
  });

  const account = await getClientAccountSnapshot(user.id);

  return {
    account,
    profile,
    userId: user.id,
  };
}

export async function consumeVerifiedChallenge(input: {
  challengeId: string;
  phone: string;
  purpose: ClientVerificationPurpose;
}) {
  const phoneNormalized = normalizeClientPhone(input.phone);

  if (!phoneNormalized) {
    throw new Error("Enter a valid mobile number.");
  }

  const [challenge] = await db
    .select()
    .from(clientPhoneVerificationChallenges)
    .where(
      and(
        eq(clientPhoneVerificationChallenges.id, input.challengeId),
        eq(clientPhoneVerificationChallenges.phoneNormalized, phoneNormalized),
        eq(clientPhoneVerificationChallenges.purpose, input.purpose),
        isNull(clientPhoneVerificationChallenges.consumedAt),
      ),
    )
    .limit(1);

  if (!challenge?.verifiedAt) {
    throw new Error("Phone verification is incomplete.");
  }

  if (challenge.expiresAt <= new Date()) {
    throw new Error("The verified code has expired. Verify again.");
  }

  await db
    .update(clientPhoneVerificationChallenges)
    .set({
      consumedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(clientPhoneVerificationChallenges.id, challenge.id));

  return challenge;
}

export async function upsertClientProfile(input: {
  userId: string;
  phone: string;
  smsOptIn: boolean;
}) {
  const phoneNormalized = normalizeClientPhone(input.phone);

  if (!phoneNormalized) {
    throw new Error("Enter a valid mobile number.");
  }

  const now = new Date();

  await db
    .insert(clientProfiles)
    .values({
      userId: input.userId,
      phone: input.phone,
      phoneNormalized,
      phoneVerifiedAt: now,
      smsOptIn: input.smsOptIn,
      smsOptInAt: input.smsOptIn ? now : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: clientProfiles.userId,
      set: {
        phone: input.phone,
        phoneNormalized,
        phoneVerifiedAt: now,
        smsOptIn: input.smsOptIn,
        smsOptInAt: input.smsOptIn ? now : null,
        updatedAt: now,
      },
    });

  const [profile] = await db
    .select()
    .from(clientProfiles)
    .where(eq(clientProfiles.userId, input.userId))
    .limit(1);

  return profile ?? null;
}

export async function getClientAccountSnapshot(userId: string) {
  const [row] = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      phone: clientProfiles.phone,
      phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
      smsOptIn: clientProfiles.smsOptIn,
      userPhone: users.phoneNumber,
      userPhoneVerified: users.phoneNumberVerified,
    })
    .from(users)
    .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    email: row.email,
    name: row.name,
    phone: row.phone ?? row.userPhone ?? null,
    phoneVerifiedAt:
      row.phoneVerifiedAt ?? (row.userPhoneVerified ? new Date(0).toISOString() : null),
    smsOptIn: row.smsOptIn,
    userId: row.userId,
  };
}
