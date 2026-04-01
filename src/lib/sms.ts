import twilio from "twilio";

import { env } from "@/env";

let client: ReturnType<typeof twilio> | null = null;

export function getSmsSenderConfig() {
  if (env.twilioMessagingServiceSid) {
    return {
      mode: "messaging-service" as const,
      value: env.twilioMessagingServiceSid,
    };
  }

  if (env.twilioFromNumber) {
    return {
      mode: "from-number" as const,
      value: env.twilioFromNumber,
    };
  }

  return {
    mode: "unconfigured" as const,
    value: "",
  };
}

export function getOtpSmsSenderConfig() {
  if (env.twilioOtpMessagingServiceSid) {
    return {
      mode: "messaging-service" as const,
      value: env.twilioOtpMessagingServiceSid,
    };
  }

  return getSmsSenderConfig();
}

export function isTwilioVerifyConfigured() {
  return Boolean(
    env.twilioAccountSid &&
      (env.twilioAuthToken ||
        (env.twilioApiKeySid && env.twilioApiKeySecret)) &&
      env.twilioVerifyServiceSid,
  );
}

export function getSmsStatusCallbackUrl() {
  const callbackUrl = new URL("/api/twilio/status", env.appUrl);

  if (
    callbackUrl.protocol !== "https:" ||
    callbackUrl.hostname === "localhost" ||
    callbackUrl.hostname === "127.0.0.1"
  ) {
    return null;
  }

  return callbackUrl.toString();
}

export function isSmsConfigured() {
  const sender = getSmsSenderConfig();

  return Boolean(
    env.twilioAccountSid &&
      (env.twilioAuthToken ||
        (env.twilioApiKeySid && env.twilioApiKeySecret)) &&
      sender.value,
  );
}

function getSmsClient() {
  if (!isSmsConfigured()) {
    throw new Error("Twilio SMS is not configured.");
  }

  if (!client) {
    client = env.twilioAuthToken
      ? twilio(env.twilioAccountSid, env.twilioAuthToken)
      : twilio(env.twilioApiKeySid, env.twilioApiKeySecret, {
          accountSid: env.twilioAccountSid,
        });
  }

  return client;
}

function getTwilioClient() {
  if (!env.twilioAccountSid) {
    throw new Error("Twilio account is not configured.");
  }

  if (!client) {
    client = env.twilioAuthToken
      ? twilio(env.twilioAccountSid, env.twilioAuthToken)
      : twilio(env.twilioApiKeySid, env.twilioApiKeySecret, {
          accountSid: env.twilioAccountSid,
        });
  }

  return client;
}

export function normalizePhoneNumber(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("+")) {
    const normalized = `+${trimmed.slice(1).replace(/\D/g, "")}`;
    return normalized.length >= 11 ? normalized : null;
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

export function getDispatchSmsRecipients() {
  return env.twilioDispatchSmsTo
    .split(/[,\n]/)
    .map((value) => normalizePhoneNumber(value))
    .filter((value): value is string => Boolean(value));
}

export async function sendTextMessage({
  body,
  to,
  sender,
}: {
  body: string;
  to: string;
  sender?: ReturnType<typeof getSmsSenderConfig>;
}) {
  const normalizedTo = normalizePhoneNumber(to);

  if (!normalizedTo) {
    throw new Error(`Invalid SMS recipient: ${to}`);
  }

  const smsClient = getSmsClient();

  const resolvedSender = sender ?? getSmsSenderConfig();

  return smsClient.messages.create({
    body,
    ...(resolvedSender.mode === "messaging-service"
      ? { messagingServiceSid: resolvedSender.value }
      : { from: env.twilioFromNumber }),
    ...(getSmsStatusCallbackUrl()
      ? { statusCallback: getSmsStatusCallbackUrl()! }
      : {}),
    to: normalizedTo,
  });
}

export async function sendPhoneVerificationCode(to: string) {
  if (!isTwilioVerifyConfigured()) {
    throw new Error("Twilio Verify is not configured.");
  }

  const normalizedTo = normalizePhoneNumber(to);

  if (!normalizedTo) {
    throw new Error(`Invalid SMS recipient: ${to}`);
  }

  return getTwilioClient()
    .verify.v2.services(env.twilioVerifyServiceSid)
    .verifications.create({
      channel: "sms",
      to: normalizedTo,
    });
}

export async function checkPhoneVerificationCode(input: {
  code: string;
  to: string;
}) {
  if (!isTwilioVerifyConfigured()) {
    throw new Error("Twilio Verify is not configured.");
  }

  const normalizedTo = normalizePhoneNumber(input.to);

  if (!normalizedTo) {
    throw new Error(`Invalid SMS recipient: ${input.to}`);
  }

  return getTwilioClient()
    .verify.v2.services(env.twilioVerifyServiceSid)
    .verificationChecks.create({
      code: input.code,
      to: normalizedTo,
    });
}
