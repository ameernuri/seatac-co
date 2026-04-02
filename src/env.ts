const required = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET!,
  betterAuthUrl: process.env.BETTER_AUTH_URL!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  betterAuthCookiePrefix: process.env.BETTER_AUTH_COOKIE_PREFIX ?? "seatac-site",
  siteSlug: process.env.SITE_SLUG?.trim() || "seatac_co",
  adminEmail: process.env.ADMIN_EMAIL!,
  adminPassword: process.env.ADMIN_PASSWORD!,
  adminName: process.env.ADMIN_NAME ?? "seatac.co Dispatch",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeCurrency: process.env.STRIPE_CURRENCY ?? "usd",
  amadeusClientId: process.env.AMADEUS_CLIENT_ID ?? "",
  amadeusClientSecret: process.env.AMADEUS_CLIENT_SECRET ?? "",
  amadeusBaseUrl: process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com",
  bookingDemandToken: process.env.BOOKING_DEMAND_TOKEN ?? "",
  bookingDemandAffiliateId: process.env.BOOKING_DEMAND_AFFILIATE_ID ?? "",
  bookingDemandBaseUrl:
    process.env.BOOKING_DEMAND_BASE_URL ?? "https://demandapi.booking.com/3.1",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
  resendFromName: process.env.RESEND_FROM_NAME ?? "",
  resendReplyToEmail: process.env.RESEND_REPLY_TO_EMAIL ?? "",
  resendDispatchEmailTo: process.env.RESEND_DISPATCH_EMAIL_TO ?? "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioApiKeySid: process.env.TWILIO_API_KEY_SID ?? "",
  twilioApiKeySecret: process.env.TWILIO_API_KEY_SECRET ?? "",
  twilioMessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID ?? "",
  twilioOtpMessagingServiceSid:
    process.env.TWILIO_OTP_MESSAGING_SERVICE_SID ?? "",
  twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ?? "",
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER ?? "",
  twilioDispatchSmsTo: process.env.TWILIO_DISPATCH_SMS_TO ?? "",
  twilioReminderLeadHours: Number.parseInt(
    process.env.TWILIO_REMINDER_LEAD_HOURS ?? "24",
    10,
  ),
  googleSearchConsoleSiteUrl:
    process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? "sc-domain:seatac.co",
  googleSearchConsoleClientEmail: process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL ?? "",
  googleSearchConsolePrivateKey: process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY ?? "",
  googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
  googleAdsApiVersion: process.env.GOOGLE_ADS_API_VERSION ?? "v19",
  googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID ?? "",
  googleAdsLoginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ?? "",
  googleAdsClientId: process.env.GOOGLE_ADS_CLIENT_ID ?? "",
  googleAdsClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET ?? "",
  googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN ?? "",
  serpProvider: process.env.SERP_PROVIDER ?? "serpapi",
  serpApiKey: process.env.SERPAPI_API_KEY ?? "",
};
