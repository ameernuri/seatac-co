import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { clientProfiles } from "@/db/schema";
import { getServerSession } from "@/lib/session";

const patchBodySchema = z.object({
  smsOptIn: z.boolean(),
});

export async function PATCH(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const payload = patchBodySchema.parse(await request.json());
  const now = new Date();

  const [existingProfile] = await db
    .select({
      phone: clientProfiles.phone,
      phoneVerifiedAt: clientProfiles.phoneVerifiedAt,
    })
    .from(clientProfiles)
    .where(eq(clientProfiles.userId, session.user.id))
    .limit(1);

  if (!existingProfile?.phone || !existingProfile.phoneVerifiedAt) {
    return NextResponse.json(
      { error: "Verify a mobile number before changing SMS preferences." },
      { status: 400 },
    );
  }

  await db
    .update(clientProfiles)
    .set({
      smsOptIn: payload.smsOptIn,
      smsOptInAt: payload.smsOptIn ? now : null,
      updatedAt: now,
    })
    .where(eq(clientProfiles.userId, session.user.id));

  return NextResponse.json({ ok: true });
}
