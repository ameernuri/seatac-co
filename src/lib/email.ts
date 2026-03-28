import { Resend } from "resend";

import { env } from "@/env";
import { getSettingsMap } from "@/lib/data";
import { NotificationSiteContext } from "@/lib/email-templates";

let configured = false;
let resendClient: Resend | null = null;

function ensureClientConfigured() {
  if (!configured) {
    resendClient = new Resend(env.resendApiKey);
    configured = true;
  }
}

export function isEmailConfigured() {
  return Boolean(env.resendApiKey && env.resendFromEmail);
}

export function getDispatchEmailRecipients() {
  const configuredRecipients = env.resendDispatchEmailTo
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (configuredRecipients.length > 0) {
    return configuredRecipients;
  }

  return env.adminEmail ? [env.adminEmail] : [];
}

export async function getNotificationSiteContext(siteSlug: string): Promise<NotificationSiteContext> {
  const settings = await getSettingsMap(siteSlug);
  const dispatchPhone =
    typeof settings.dispatchPhone === "string" && settings.dispatchPhone
      ? settings.dispatchPhone
      : "";
  const dispatchEmail =
    typeof settings.dispatchEmail === "string" && settings.dispatchEmail
      ? settings.dispatchEmail
      : env.resendReplyToEmail || env.resendFromEmail;
  const companyName =
    typeof settings.companyName === "string" && settings.companyName
      ? settings.companyName
      : siteSlug;

  return {
    companyName,
    dispatchEmail,
    dispatchPhone,
  };
}

export async function sendEmail({
  html,
  replyTo,
  subject,
  text,
  to,
}: {
  html: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string | string[];
}) {
  if (!isEmailConfigured()) {
    throw new Error("Resend email is not configured.");
  }

  ensureClientConfigured();
  if (!resendClient) {
    throw new Error("Resend client was not initialized.");
  }

  const formattedFrom = env.resendFromName
    ? `${env.resendFromName} <${env.resendFromEmail}>`
    : env.resendFromEmail;

  const response = await resendClient.emails.send({
    from: formattedFrom,
    html,
    replyTo: replyTo ? [replyTo] : undefined,
    subject,
    text,
    to,
  });

  if (response.error) {
    throw new Error(`Resend send failed: ${response.error.message}`);
  }
}
