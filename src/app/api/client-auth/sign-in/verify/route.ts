import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createClientSession,
  findClientAccountByIdentifier,
  verifyEmailVerificationChallenge,
  verifyPhoneVerificationChallenge,
} from "@/lib/client-auth";
import { env } from "@/env";

const bodySchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().trim().length(6),
  identifier: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const account = await findClientAccountByIdentifier({
      identifier: payload.identifier,
    });

    if (account.signInChannel === "email") {
      await verifyEmailVerificationChallenge({
        challengeId: payload.challengeId,
        code: payload.code,
        email: account.email,
        purpose: "sign-in",
      });
    } else {
      await verifyPhoneVerificationChallenge({
        challengeId: payload.challengeId,
        code: payload.code,
        phone: account.phoneNormalized ?? account.phone ?? "",
        purpose: "sign-in",
      });
    }

    const session = await createClientSession({
      userId: account.userId,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent"),
    });

    const response = NextResponse.json({ account });
    response.cookies.set(`${env.betterAuthCookiePrefix}.session_token`, session.token, {
      expires: session.expiresAt,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: env.appUrl.startsWith("https://"),
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Phone verification could not be completed.",
      },
      { status: 400 },
    );
  }
}
