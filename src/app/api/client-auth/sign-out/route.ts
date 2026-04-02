import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { sessions } from "@/db/schema";
import { env } from "@/env";

export async function POST() {
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(`${env.betterAuthCookiePrefix}.session_token`)?.value;
  const token = rawSessionToken?.split(".")[0];

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(`${env.betterAuthCookiePrefix}.session_token`, "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: env.appUrl.startsWith("https://"),
  });

  return response;
}
