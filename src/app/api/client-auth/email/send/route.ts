import { NextResponse } from "next/server";
import { z } from "zod";

import {
  clientVerificationPurposes,
  createEmailVerificationChallenge,
} from "@/lib/client-auth";

const bodySchema = z.object({
  email: z.string().email(),
  purpose: z.enum(clientVerificationPurposes),
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const { challenge, developmentCode } = await createEmailVerificationChallenge(payload);

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
