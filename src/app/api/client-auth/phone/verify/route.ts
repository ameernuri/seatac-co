import { NextResponse } from "next/server";
import { z } from "zod";

import {
  clientVerificationPurposes,
  verifyPhoneVerificationChallenge,
} from "@/lib/client-auth";

const bodySchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().trim().length(6),
  phone: z.string().min(7),
  purpose: z.enum(clientVerificationPurposes),
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const challenge = await verifyPhoneVerificationChallenge(payload);

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
