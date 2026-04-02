import {
  createHash,
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { eq, or } from "drizzle-orm";

import { db } from "@/db/client";
import {
  clientProfiles,
  sessions,
  users,
} from "@/db/schema";
import { env } from "@/env";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import {
  checkPhoneVerificationCode,
  getOtpSmsSenderConfig,
  isSmsConfigured,
  isTwilioVerifyConfigured,
  normalizePhoneNumber,
  sendPhoneVerificationCode,
  sendTextMessage,
} from "@/lib/sms";

export const clientVerificationPurposes = [
  "sign-up",
  "reserve-account",
  "sign-in",
] as const;
export type ClientVerificationPurpose = (typeof clientVerificationPurposes)[number];

const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_TTL_MINUTES = 10;

type SignedVerificationPayload = {
  channel: "email" | "phone";
  codeHash: string | null;
  email: string | null;
  expiresAt: string;
  nonce: string;
  phoneNormalized: string | null;
  purpose: ClientVerificationPurpose;
  verifiedAt: string | null;
};

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

function signVerificationPayload(payload: SignedVerificationPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", env.betterAuthSecret)
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function readVerificationPayload(token: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    throw new Error("Verification session could not be found.");
  }

  const expectedSignature = createHmac("sha256", env.betterAuthSecret)
    .update(body)
    .digest("base64url");

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new Error("Verification session could not be found.");
  }

  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8"),
  ) as SignedVerificationPayload;

  return {
    id: token,
    ...payload,
    expiresAt: new Date(payload.expiresAt),
    verifiedAt: payload.verifiedAt ? new Date(payload.verifiedAt) : null,
  };
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
  const useTwilioVerify = isTwilioVerifyConfigured();

  if (useTwilioVerify) {
    await sendPhoneVerificationCode(phoneNormalized);
  } else if (getOtpSmsSenderConfig().value) {
    await sendTextMessage({
      to: phoneNormalized,
      sender: getOtpSmsSenderConfig(),
      body: `seatac.co verification code: ${code}. This code expires in ${VERIFICATION_TTL_MINUTES} minutes.`,
    });
  } else if (isSmsConfigured()) {
    await sendTextMessage({
      to: phoneNormalized,
      body: `seatac.co verification code: ${code}. This code expires in ${VERIFICATION_TTL_MINUTES} minutes.`,
    });
  }

  const challenge = {
    id: signVerificationPayload({
      channel: "phone",
      codeHash: useTwilioVerify ? null : hashVerificationCode(code),
      email: null,
      expiresAt: expiresAt.toISOString(),
      nonce: randomUUID(),
      phoneNormalized,
      purpose: input.purpose,
      verifiedAt: null,
    }),
    purpose: input.purpose,
    phoneNormalized,
    codeHash: useTwilioVerify ? "" : hashVerificationCode(code),
    attempts: 0,
    expiresAt,
    verifiedAt: null,
    consumedAt: null,
    createdAt: now,
    updatedAt: now,
  };

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

  const challenge = readVerificationPayload(input.challengeId);

  if (
    challenge.channel !== "phone" ||
    challenge.phoneNormalized !== phoneNormalized ||
    challenge.purpose !== input.purpose
  ) {
    throw new Error("Verification session could not be found.");
  }

  if (challenge.verifiedAt) {
    return challenge;
  }

  if (challenge.expiresAt <= new Date()) {
    throw new Error("That code has expired. Request a new one.");
  }

  if (challenge.codeHash) {
    if (challenge.codeHash !== hashVerificationCode(input.code)) {
      throw new Error("That code is not correct.");
    }
  } else {
    const result = await checkPhoneVerificationCode({
      code: input.code,
      to: phoneNormalized,
    });

    if (result.status !== "approved") {
      throw new Error("That code is not correct.");
    }
  }

  const verifiedAt = new Date();

  return {
    ...challenge,
    id: signVerificationPayload({
      channel: "phone",
      codeHash: challenge.codeHash,
      email: challenge.email,
      expiresAt: challenge.expiresAt.toISOString(),
      nonce: challenge.nonce,
      phoneNormalized: challenge.phoneNormalized,
      purpose: challenge.purpose,
      verifiedAt: verifiedAt.toISOString(),
    }),
    verifiedAt,
    updatedAt: verifiedAt,
    createdAt: verifiedAt,
    attempts: 1,
    consumedAt: null,
  };
}

function normalizeClientEmail(input: string) {
  const email = input.trim().toLowerCase();
  return /\S+@\S+\.\S+/.test(email) ? email : "";
}

export async function createEmailVerificationChallenge(input: {
  email: string;
  purpose: ClientVerificationPurpose;
}) {
  const email = normalizeClientEmail(input.email);

  if (!email) {
    throw new Error("Enter a valid email.");
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MINUTES * 60 * 1000);
  const now = new Date();

  if (isEmailConfigured()) {
    const text = `Your seatac.co verification code is ${code}. This code expires in ${VERIFICATION_TTL_MINUTES} minutes.`;
    await sendEmail({
      to: email,
      subject: "Your seatac.co verification code",
      text,
      html: `<p>Your seatac.co verification code is <strong>${code}</strong>.</p><p>This code expires in ${VERIFICATION_TTL_MINUTES} minutes.</p>`,
    });
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("Email sign-in is unavailable right now.");
  }

  const codeHash = hashVerificationCode(code);
  const challenge = {
    id: signVerificationPayload({
      channel: "email",
      codeHash,
      email,
      expiresAt: expiresAt.toISOString(),
      nonce: randomUUID(),
      phoneNormalized: null,
      purpose: input.purpose,
      verifiedAt: null,
    }),
    purpose: input.purpose,
    phoneNormalized: "",
    codeHash,
    attempts: 0,
    expiresAt,
    verifiedAt: null,
    consumedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  return {
    challenge,
    developmentCode:
      process.env.NODE_ENV === "production" || isEmailConfigured() ? undefined : code,
  };
}

export async function verifyEmailVerificationChallenge(input: {
  challengeId: string;
  code: string;
  email: string;
  purpose: ClientVerificationPurpose;
}) {
  const email = normalizeClientEmail(input.email);

  if (!email) {
    throw new Error("Enter a valid email.");
  }

  const challenge = readVerificationPayload(input.challengeId);

  if (
    challenge.channel !== "email" ||
    challenge.email !== email ||
    challenge.purpose !== input.purpose
  ) {
    throw new Error("Verification session could not be found.");
  }

  if (challenge.verifiedAt) {
    return challenge;
  }

  if (challenge.expiresAt <= new Date()) {
    throw new Error("That code has expired. Request a new one.");
  }

  if (!challenge.codeHash || challenge.codeHash !== hashVerificationCode(input.code)) {
    throw new Error("That code is not correct.");
  }

  const verifiedAt = new Date();

  return {
    ...challenge,
    id: signVerificationPayload({
      channel: "email",
      codeHash: challenge.codeHash,
      email: challenge.email,
      expiresAt: challenge.expiresAt.toISOString(),
      nonce: challenge.nonce,
      phoneNormalized: challenge.phoneNormalized,
      purpose: challenge.purpose,
      verifiedAt: verifiedAt.toISOString(),
    }),
    verifiedAt,
    updatedAt: verifiedAt,
    createdAt: verifiedAt,
    attempts: 1,
    consumedAt: null,
  };
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
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const [existingByPhone] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(clientProfiles)
    .innerJoin(users, eq(clientProfiles.userId, users.id))
    .where(eq(clientProfiles.phoneNormalized, phoneNormalized))
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

  const existingUser = existingByPhone ?? existingByEmail ?? null;
  let user = existingUser;

  if (!user) {
    const [createdUser] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name,
        email,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    user = createdUser ?? null;

    if (!user) {
      throw new Error("Account could not be created.");
    }
  } else {
    await db
      .update(users)
      .set({
        email,
        name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

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
    existed: Boolean(existingUser),
  };
}

export async function findClientAccountByIdentifier(input: { identifier: string }) {
  const identifier = input.identifier.trim();

  if (!identifier) {
    throw new Error("Enter your email or mobile number.");
  }

  if (identifier.includes("@")) {
    const email = identifier.toLowerCase();
    const [row] = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        phone: clientProfiles.phone,
        phoneNormalized: clientProfiles.phoneNormalized,
        phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
        smsOptIn: clientProfiles.smsOptIn,
      })
      .from(users)
      .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!row) {
      throw new Error("No account was found for that email.");
    }

    if (!row.emailVerified) {
      throw new Error(
        "That email address is not verified. Sign in with your verified mobile number instead.",
      );
    }

    return {
      ...row,
      signInChannel: "email" as const,
    };
  }

  const phoneNormalized = normalizeClientPhone(identifier);

  if (!phoneNormalized) {
    throw new Error("Enter a valid email or mobile number.");
  }

  const [row] = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      phone: clientProfiles.phone,
      phoneNormalized: clientProfiles.phoneNormalized,
      phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
      smsOptIn: clientProfiles.smsOptIn,
    })
    .from(clientProfiles)
    .innerJoin(users, eq(clientProfiles.userId, users.id))
    .where(eq(clientProfiles.phoneNormalized, phoneNormalized))
    .limit(1);

  if (!row) {
    throw new Error("No account was found for that mobile number.");
  }

  return {
    ...row,
    signInChannel: "phone" as const,
  };
}

export async function createClientSession(input: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
  const token = randomUUID();

  const [session] = await db
    .insert(sessions)
    .values({
      id: randomUUID(),
      userId: input.userId,
      token,
      expiresAt,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!session) {
    throw new Error("Session could not be created.");
  }

  return session;
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

  const challenge = readVerificationPayload(input.challengeId);

  if (
    challenge.phoneNormalized !== phoneNormalized ||
    challenge.purpose !== input.purpose
  ) {
    throw new Error("Verification session could not be found.");
  }

  if (!challenge.verifiedAt) {
    throw new Error("Phone verification is incomplete.");
  }

  if (challenge.expiresAt <= new Date()) {
    throw new Error("The verified code has expired. Verify again.");
  }

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
    phone: row.phone ?? null,
    phoneVerifiedAt: row.phoneVerifiedAt,
    smsOptIn: row.smsOptIn,
    userId: row.userId,
  };
}
