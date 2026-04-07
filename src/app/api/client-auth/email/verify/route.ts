import { NextResponse } from "next/server";
import { z } from "zod";

import {
  clientVerificationPurposes,
  verifyEmailVerificationChallenge,
} from "@/lib/client-auth";

const bodySchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().trim().length(6),
  email: z.string().email(),
  purpose: z.enum(clientVerificationPurposes),
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const challenge = await verifyEmailVerificationChallenge(payload);

    return NextResponse.json({
      challengeId: challenge.id,
      verifiedAt: challenge.verifiedAt?.toISOString() ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Verification code could not be checked.",
      },
      { status: 400 },
    );
  }
}
