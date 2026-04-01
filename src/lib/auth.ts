import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { phoneNumber } from "better-auth/plugins";

import { db } from "@/db/client";
import { schema } from "@/db/schema";
import { env } from "@/env";
import { normalizePhoneNumber, sendTextMessage } from "@/lib/sms";

const trustedOrigins = Array.from(
  new Set([
    env.appUrl,
    env.betterAuthUrl,
    "http://localhost:3000",
    "http://localhost:4000",
    "http://localhost:4002",
    "http://localhost:4003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4000",
    "http://127.0.0.1:4002",
    "http://127.0.0.1:4003",
  ]),
);

export const auth = betterAuth({
  appName: "seatac.co",
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  trustedOrigins,
  advanced: {
    cookiePrefix: env.betterAuthCookiePrefix,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    phoneNumber({
      allowedAttempts: 5,
      expiresIn: 60 * 10,
      phoneNumberValidator(phoneNumber) {
        return Boolean(normalizePhoneNumber(phoneNumber));
      },
      sendOTP: async ({ phoneNumber, code }) => {
        const normalized = normalizePhoneNumber(phoneNumber);

        if (!normalized) {
          throw new Error("Invalid phone number.");
        }

        await sendTextMessage({
          body: `seatac.co verification code: ${code}. This code expires in 10 minutes.`,
          to: normalized,
        });
      },
      signUpOnVerification: {
        getTempEmail(phoneNumber) {
          const normalized = normalizePhoneNumber(phoneNumber) ?? phoneNumber;
          const digits = normalized.replace(/\D/g, "");
          return `phone-${digits}@seatac.local`;
        },
        getTempName(phoneNumber) {
          const normalized = normalizePhoneNumber(phoneNumber) ?? phoneNumber;
          return `Client ${normalized.slice(-4)}`;
        },
      },
    }),
    nextCookies(),
  ],
});
