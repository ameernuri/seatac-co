import { NextResponse } from "next/server";
import { z } from "zod";

import {
  clientVerificationPurposes,
  createPhoneVerificationChallenge,
} from "@/lib/client-auth";

const bodySchema = z.object({
  phone: z.string().min(7),
  purpose: z.enum(clientVerificationPurposes),
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const { challenge, developmentCode } = await createPhoneVerificationChallenge(payload);

    return NextResponse.json({
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt.toISOString(),
      developmentCode,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Verification code could not be sent.",
      },
      { status: 400 },
    );
  }
}
