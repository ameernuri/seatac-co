import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env";
import { getReserveSuccessState, isStripeConfigured } from "@/lib/stripe";

const proofRequestSchema = z.object({
  sessionId: z.string().min(8),
});

function readProofSecret() {
  return process.env.PROOF_RUNNER_SECRET?.trim() || env.betterAuthSecret;
}

export async function POST(request: Request) {
  const expectedSecret = readProofSecret();
  const providedSecret = request.headers.get("x-proof-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized proof request." }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured for reserve-success proof requests." },
      { status: 503 },
    );
  }

  const payload = proofRequestSchema.parse(await request.json());
  const result = await getReserveSuccessState(payload.sessionId);

  if (!result) {
    return NextResponse.json({ error: "Booking not found for this checkout session." }, { status: 404 });
  }

  return NextResponse.json(result);
}
