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

export function getSmsStatusCallbackUrl() {
  return new URL("/api/twilio/status", env.appUrl).toString();
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
}: {
  body: string;
  to: string;
}) {
  const normalizedTo = normalizePhoneNumber(to);

  if (!normalizedTo) {
    throw new Error(`Invalid SMS recipient: ${to}`);
  }

  const smsClient = getSmsClient();

  return smsClient.messages.create({
    body,
    ...(getSmsSenderConfig().mode === "messaging-service"
      ? { messagingServiceSid: env.twilioMessagingServiceSid }
      : { from: env.twilioFromNumber }),
    statusCallback: getSmsStatusCallbackUrl(),
    to: normalizedTo,
  });
}
