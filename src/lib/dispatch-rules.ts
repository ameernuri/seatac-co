import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

export const DISPATCH_RULES_KEY = "dispatchRules";

export const defaultDispatchRules = {
  pickupBufferMinutes: 60,
  dropoffBufferMinutes: 60,
  minimumTransferMinutes: 15,
  fallbackTransferMinutes: 30,
  defaultRouteDurationMinutes: 90,
} as const;

const dispatchRulesSchema = z.object({
  pickupBufferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  dropoffBufferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  minimumTransferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  fallbackTransferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  defaultRouteDurationMinutes: z.number().int().min(15).max(24 * 60).optional(),
  minimumBufferMinutes: z.number().int().min(0).max(24 * 60).optional(),
});

export type DispatchRules = {
  defaultRouteDurationMinutes: number;
  dropoffBufferMinutes: number;
  fallbackTransferMinutes: number;
  minimumTransferMinutes: number;
  pickupBufferMinutes: number;
};

const dispatchOverrideSchema = z.object({
  pickupBufferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  dropoffBufferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  minimumTransferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  transferMinutes: z.number().int().min(0).max(24 * 60).optional(),
  minimumBufferMinutes: z.number().int().min(0).max(24 * 60).optional(),
});

export type DispatchOverride = {
  dropoffBufferMinutes?: number;
  minimumTransferMinutes?: number;
  pickupBufferMinutes?: number;
  transferMinutes?: number;
};

export function normalizeDispatchRules(value: unknown): DispatchRules {
  const parsed = dispatchRulesSchema.safeParse(value);

  if (!parsed.success) {
    return {
      ...defaultDispatchRules,
    };
  }

  return {
    defaultRouteDurationMinutes:
      parsed.data.defaultRouteDurationMinutes ??
      defaultDispatchRules.defaultRouteDurationMinutes,
    dropoffBufferMinutes:
      parsed.data.dropoffBufferMinutes ??
      parsed.data.minimumBufferMinutes ??
      defaultDispatchRules.dropoffBufferMinutes,
    fallbackTransferMinutes:
      parsed.data.fallbackTransferMinutes ??
      defaultDispatchRules.fallbackTransferMinutes,
    minimumTransferMinutes:
      parsed.data.minimumTransferMinutes ??
      defaultDispatchRules.minimumTransferMinutes,
    pickupBufferMinutes:
      parsed.data.pickupBufferMinutes ??
      parsed.data.minimumBufferMinutes ??
      defaultDispatchRules.pickupBufferMinutes,
  };
}

export function normalizeDispatchOverride(value: unknown): DispatchOverride {
  const parsed = dispatchOverrideSchema.safeParse(value);

  if (!parsed.success) {
    return {};
  }

  return {
    dropoffBufferMinutes:
      parsed.data.dropoffBufferMinutes ?? parsed.data.minimumBufferMinutes,
    minimumTransferMinutes: parsed.data.minimumTransferMinutes,
    pickupBufferMinutes:
      parsed.data.pickupBufferMinutes ?? parsed.data.minimumBufferMinutes,
    transferMinutes: parsed.data.transferMinutes,
  };
}

export function applyDispatchOverride(
  rules: DispatchRules,
  override: DispatchOverride,
) {
  return {
    dropoffBufferMinutes:
      override.dropoffBufferMinutes ?? rules.dropoffBufferMinutes,
    minimumTransferMinutes:
      override.minimumTransferMinutes ?? rules.minimumTransferMinutes,
    pickupBufferMinutes:
      override.pickupBufferMinutes ?? rules.pickupBufferMinutes,
    transferMinutes: override.transferMinutes,
  };
}

export function resolveTransferMinutes({
  estimatedTransferMinutes,
  rules,
  transferOverrideMinutes,
}: {
  estimatedTransferMinutes: number | null;
  rules: Pick<DispatchRules, "fallbackTransferMinutes" | "minimumTransferMinutes">;
  transferOverrideMinutes?: number;
}) {
  if (transferOverrideMinutes !== undefined) {
    return transferOverrideMinutes;
  }

  const estimatedOrFallback =
    estimatedTransferMinutes ?? rules.fallbackTransferMinutes;

  return Math.max(estimatedOrFallback, rules.minimumTransferMinutes);
}

export async function getDispatchRulesBySiteId(siteId: string) {
  const row = await db.query.siteSettings.findFirst({
    where: and(eq(siteSettings.siteId, siteId), eq(siteSettings.key, DISPATCH_RULES_KEY)),
  });

  return normalizeDispatchRules(row?.value);
}

export async function getDispatchRulesBySiteIds(siteIds: string[]) {
  if (siteIds.length === 0) {
    return new Map<string, DispatchRules>();
  }

  const rows = await db
    .select()
    .from(siteSettings)
    .where(
      and(
        inArray(siteSettings.siteId, Array.from(new Set(siteIds))),
        eq(siteSettings.key, DISPATCH_RULES_KEY),
      ),
    );

  return new Map(
    rows.map((row) => [row.siteId, normalizeDispatchRules(row.value)]),
  );
}
