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
  siteSlug: process.env.SITE_SLUG ?? "seatacdrive",
  adminEmail: process.env.ADMIN_EMAIL!,
  adminPassword: process.env.ADMIN_PASSWORD!,
  adminName: process.env.ADMIN_NAME ?? "seatac.co Dispatch",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeCurrency: process.env.STRIPE_CURRENCY ?? "usd",
};
