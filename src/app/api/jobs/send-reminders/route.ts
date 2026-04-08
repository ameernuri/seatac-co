import { NextResponse } from "next/server";

import { env } from "@/env";
import { sendDueCustomerSmsReminders } from "@/lib/reminders";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request) {
  if (!env.cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${env.cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "1";
  const references = searchParams.getAll("reference").filter(Boolean);
  const result = await sendDueCustomerSmsReminders({
    dryRun,
    references: references.length ? references : undefined,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}
