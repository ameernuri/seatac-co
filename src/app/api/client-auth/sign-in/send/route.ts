import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createEmailVerificationChallenge,
  createPhoneVerificationChallenge,
  findClientAccountByIdentifier,
} from "@/lib/client-auth";

const bodySchema = z.object({
  identifier: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const account = await findClientAccountByIdentifier({
      identifier: payload.identifier,
    });

    const { challenge, developmentCode } =
      account.signInChannel === "email"
        ? await createEmailVerificationChallenge({
            email: account.email,
            purpose: "sign-in",
          })
        : await createPhoneVerificationChallenge({
            phone: account.phoneNormalized ?? account.phone ?? "",
            purpose: "sign-in",
          });

    return NextResponse.json({
      challengeId: challenge.id,
      developmentCode,
      expiresAt: challenge.expiresAt.toISOString(),
      channel: account.signInChannel,
      maskedEmail: account.signInChannel === "email" ? account.email : null,
      maskedPhone: account.phone,
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
