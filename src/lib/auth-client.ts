"use client";

import { createAuthClient } from "better-auth/react";
import { phoneNumberClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined"
      ? `${process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4002"}/api/auth`
      : `${window.location.origin}/api/auth`,
  plugins: [phoneNumberClient()],
});
