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
import { normalizeClientPhone } from "@/lib/client-phone";
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
  "profile-update",
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

function collectErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== "object") {
    return [];
  }

  const values = Object.values(error as Record<string, unknown>);
  const directMessage =
    "message" in error && typeof (error as { message?: unknown }).message === "string"
      ? [(error as { message: string }).message]
      : [];

  return [...directMessage, ...values.flatMap((value) => collectErrorMessages(value))];
}

function errorMentions(error: unknown, ...needles: string[]) {
  const haystack = collectErrorMessages(error).join("\n").toLowerCase();
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

function isMissingPolicyAgreementColumnError(error: unknown) {
  return errorMentions(error, "policy_agreed_at");
}

function isMissingUserPhoneColumnsError(error: unknown) {
  return errorMentions(error, "phone_number", "phone_number_verified");
}

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
    const text = [
      `${code} is your seatac.co verification code.`,
      "",
      `This code expires in ${VERIFICATION_TTL_MINUTES} minutes.`,
      "",
      "If you did not request this code, you can ignore this email.",
    ].join("\n");
    await sendEmail({
      to: email,
      subject: `${code} is your seatac.co verification code`,
      text,
      html: `
        <div style="margin:0;padding:32px 20px;background:#f7faf8;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a3d34;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(45,106,79,0.12);border-radius:28px;overflow:hidden;">
            <div style="padding:28px 28px 0 28px;">
              <p style="margin:0 0 10px 0;font-size:12px;line-height:1.4;letter-spacing:0.24em;text-transform:uppercase;color:#5a7a6e;">seatac.co</p>
              <h1 style="margin:0;font-size:32px;line-height:1.05;font-weight:700;color:#1a3d34;">Your verification code</h1>
              <p style="margin:14px 0 0 0;font-size:16px;line-height:1.6;color:#4c6b61;">
                Use this code to continue your seatac.co sign-in or account update.
              </p>
            </div>
            <div style="padding:24px 28px 8px 28px;">
              <div style="display:inline-block;padding:18px 24px;border-radius:20px;background:#edf6f1;border:1px solid rgba(45,106,79,0.12);font-size:36px;line-height:1;letter-spacing:0.22em;font-weight:700;color:#1a3d34;">
                ${code}
              </div>
            </div>
            <div style="padding:8px 28px 28px 28px;">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#5a7a6e;">
                This code expires in ${VERIFICATION_TTL_MINUTES} minutes.
              </p>
              <p style="margin:14px 0 0 0;font-size:14px;line-height:1.7;color:#5a7a6e;">
                If you did not request this code, you can ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
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
  policyAgreed: boolean;
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
        phoneNumber: input.phone,
        phoneNumberVerified: true,
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
        phoneNumber: input.phone,
        phoneNumberVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  const existingAccountSnapshot = user
    ? await getClientAccountSnapshot(user.id).catch(() => null)
    : null;
  const effectiveSmsOptIn = Boolean(
    input.smsOptIn || existingAccountSnapshot?.smsOptIn,
  );
  const effectivePolicyAgreed =
    input.policyAgreed || Boolean(existingAccountSnapshot?.policyAgreedAt);

  const profile = await upsertClientProfile({
    policyAgreed: effectivePolicyAgreed,
    userId: user.id,
    phone: input.phone,
    smsOptIn: effectiveSmsOptIn,
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
    let row:
      | {
          userId: string;
          name: string;
          email: string;
          emailVerified: boolean;
          phone: string | null;
          phoneNormalized: string | null;
          phoneVerifiedAt: Date | null;
          policyAgreedAt: Date | null;
          smsOptIn: boolean | null;
        }
      | undefined;

    try {
      [row] = await db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          phone: clientProfiles.phone,
          phoneNormalized: clientProfiles.phoneNormalized,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          policyAgreedAt: clientProfiles.policyAgreedAt,
          smsOptIn: clientProfiles.smsOptIn,
        })
        .from(users)
        .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
        .where(eq(users.email, email))
        .limit(1);
    } catch (error) {
      if (!isMissingPolicyAgreementColumnError(error)) throw error;

      const [fallbackRow] = await db
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

      row = fallbackRow ? { ...fallbackRow, policyAgreedAt: null } : undefined;
    }

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

  let row:
    | {
        userId: string;
        name: string;
        email: string;
        emailVerified: boolean;
        phone: string | null;
        phoneNormalized: string | null;
        phoneVerifiedAt: Date | null;
        policyAgreedAt: Date | null;
        smsOptIn: boolean | null;
      }
    | undefined;

  try {
    [row] = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        phone: clientProfiles.phone,
        phoneNormalized: clientProfiles.phoneNormalized,
        phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
        policyAgreedAt: clientProfiles.policyAgreedAt,
        smsOptIn: clientProfiles.smsOptIn,
      })
      .from(clientProfiles)
      .innerJoin(users, eq(clientProfiles.userId, users.id))
      .where(eq(clientProfiles.phoneNormalized, phoneNormalized))
      .limit(1);
  } catch (error) {
    if (!isMissingPolicyAgreementColumnError(error)) throw error;

    const [fallbackRow] = await db
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

    row = fallbackRow ? { ...fallbackRow, policyAgreedAt: null } : undefined;
  }

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

export function consumeVerifiedPhoneToken(input: {
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
    challenge.channel !== "phone" ||
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

export function consumeVerifiedEmailToken(input: {
  challengeId: string;
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

  if (!challenge.verifiedAt) {
    throw new Error("Email verification is incomplete.");
  }

  if (challenge.expiresAt <= new Date()) {
    throw new Error("The verified code has expired. Verify again.");
  }

  return challenge;
}

export async function upsertClientProfile(input: {
  policyAgreed: boolean;
  userId: string;
  phone: string;
  smsOptIn: boolean;
  phoneVerified?: boolean;
}) {
  const phoneNormalized = normalizeClientPhone(input.phone);

  if (!phoneNormalized) {
    throw new Error("Enter a valid mobile number.");
  }

  const now = new Date();
  const [existingProfile] = await db
    .select({
      phoneNormalized: clientProfiles.phoneNormalized,
      phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
    })
    .from(clientProfiles)
    .where(eq(clientProfiles.userId, input.userId))
    .limit(1);
  const samePhone = existingProfile?.phoneNormalized === phoneNormalized;
  const nextPhoneVerifiedAt =
    samePhone
      ? existingProfile?.phoneVerifiedAt ?? (input.phoneVerified !== false ? now : null)
      : input.phoneVerified === false
        ? null
        : now;
  const updateSet: {
    phone: string;
    phoneNormalized: string;
    phoneVerifiedAt: Date | null;
    smsOptIn: boolean;
    smsOptInAt: Date | null;
    updatedAt: Date;
    policyAgreedAt?: Date;
  } = {
    phone: input.phone,
    phoneNormalized,
    phoneVerifiedAt: nextPhoneVerifiedAt,
    smsOptIn: input.smsOptIn,
    smsOptInAt: input.smsOptIn ? now : null,
    updatedAt: now,
  };

  if (input.policyAgreed) {
    updateSet.policyAgreedAt = now;
  }

  const readProfile = async () => {
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
      .where(eq(clientProfiles.userId, input.userId))
      .limit(1);

    return profile
      ? {
          ...profile,
          policyAgreedAt: null,
        }
      : null;
  };

  const writeAttempts = existingProfile
    ? [
        async () => {
          await db
            .update(clientProfiles)
            .set(updateSet)
            .where(eq(clientProfiles.userId, input.userId));

          const [profile] = await db
            .select()
            .from(clientProfiles)
            .where(eq(clientProfiles.userId, input.userId))
            .limit(1);

          return profile ?? null;
        },
        async () => {
          await db
            .update(clientProfiles)
            .set({
              phone: input.phone,
              phoneNormalized,
              phoneVerifiedAt: nextPhoneVerifiedAt,
              smsOptIn: input.smsOptIn,
              smsOptInAt: input.smsOptIn ? now : null,
              updatedAt: now,
            })
            .where(eq(clientProfiles.userId, input.userId));

          return readProfile();
        },
      ]
    : [
        async () => {
          await db
            .insert(clientProfiles)
            .values({
              createdAt: now,
              policyAgreedAt: input.policyAgreed ? now : null,
              userId: input.userId,
              phone: input.phone,
              phoneNormalized,
              phoneVerifiedAt: nextPhoneVerifiedAt,
              smsOptIn: input.smsOptIn,
              smsOptInAt: input.smsOptIn ? now : null,
              updatedAt: now,
            });

          const [profile] = await db
            .select()
            .from(clientProfiles)
            .where(eq(clientProfiles.userId, input.userId))
            .limit(1);

          return profile ?? null;
        },
        async () => {
          await db
            .insert(clientProfiles)
            .values({
              createdAt: now,
              userId: input.userId,
              phone: input.phone,
              phoneNormalized,
              phoneVerifiedAt: nextPhoneVerifiedAt,
              smsOptIn: input.smsOptIn,
              smsOptInAt: input.smsOptIn ? now : null,
              updatedAt: now,
            });

          return readProfile();
        },
      ];

  let lastError: unknown;

  for (const [index, attempt] of writeAttempts.entries()) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;

      if (index === 0 && isMissingPolicyAgreementColumnError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function getClientAccountSnapshot(userId: string) {
  const attempts = [
    async () => {
      const [row] = await db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          phone: clientProfiles.phone,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          policyAgreedAt: clientProfiles.policyAgreedAt,
          smsOptIn: clientProfiles.smsOptIn,
          fallbackPhone: users.phoneNumber,
          fallbackPhoneVerified: users.phoneNumberVerified,
        })
        .from(users)
        .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);

      return row;
    },
    async () => {
      const [row] = await db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          phone: clientProfiles.phone,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          smsOptIn: clientProfiles.smsOptIn,
          fallbackPhone: users.phoneNumber,
          fallbackPhoneVerified: users.phoneNumberVerified,
        })
        .from(users)
        .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);

      return row ? { ...row, policyAgreedAt: null } : undefined;
    },
    async () => {
      const [row] = await db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          phone: clientProfiles.phone,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          policyAgreedAt: clientProfiles.policyAgreedAt,
          smsOptIn: clientProfiles.smsOptIn,
        })
        .from(users)
        .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);

      return row
        ? {
            ...row,
            fallbackPhone: null,
            fallbackPhoneVerified: false,
          }
        : undefined;
    },
    async () => {
      const [row] = await db
        .select({
          userId: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
          phone: clientProfiles.phone,
          phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
          smsOptIn: clientProfiles.smsOptIn,
        })
        .from(users)
        .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);

      return row
        ? {
            ...row,
            policyAgreedAt: null,
            fallbackPhone: null,
            fallbackPhoneVerified: false,
          }
        : undefined;
    },
  ] as const;

  let row:
    | {
        userId: string;
        name: string;
        email: string;
        emailVerified: boolean;
        phone: string | null;
        phoneVerifiedAt: Date | null;
        policyAgreedAt: Date | null;
        smsOptIn: boolean | null;
        fallbackPhone: string | null;
        fallbackPhoneVerified: boolean;
      }
    | undefined;
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      row = await attempt();
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  if (!row) {
    return null;
  }

  return {
    email: row.email,
    emailVerified: row.emailVerified,
    name: row.name,
    policyAgreedAt: row.policyAgreedAt,
    phone: row.phone ?? row.fallbackPhone ?? null,
    phoneVerifiedAt:
      row.phoneVerifiedAt ?? (row.fallbackPhoneVerified ? new Date(0) : null),
    smsOptIn: row.smsOptIn,
    userId: row.userId,
  };
}

export async function getUserAccountBasics(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      phoneNumber: users.phoneNumber,
      phoneNumberVerified: users.phoneNumberVerified,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}
