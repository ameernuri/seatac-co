import { estimateDriveMinutes } from "@/lib/drive-estimate";
import {
  applyDispatchOverride,
  resolveTransferMinutes,
  type DispatchOverride,
  type DispatchRules,
} from "@/lib/dispatch-rules";

export type AvailabilityBookingWindow = {
  dispatchOverride?: DispatchOverride;
  dropoffAddress: string | null;
  pickupAddress: string;
  pickupAt: Date;
  serviceEndAt: Date;
};

export type AvailabilityBlockWindow = {
  endAt: Date;
  startAt: Date;
};

export type AvailabilityTurnaroundRequirement = {
  availableGapMinutes: number;
  requiredGapMinutes: number;
  transferMinutes: number;
};

export type AvailabilityRequestInput = {
  defaultRouteDurationMinutes?: number | null;
  hoursRequested?: number | null;
  pickupAt: string;
  returnAt: string | null;
  returnTrip: boolean;
  routeDurationMinutes?: number | null;
  tripType: "flat" | "distance" | "hourly" | "event";
};

function addMinutes(value: Date | string, minutes: number) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function resolveRequestedServiceEndAt(
  input: AvailabilityRequestInput,
  rules: DispatchRules,
) {
  const pickupAt = new Date(input.pickupAt);
  const tripDurationMinutes =
    input.tripType === "hourly" || input.tripType === "event"
      ? Math.max((input.hoursRequested ?? 2) * 60, 120)
      : Math.max(
          input.routeDurationMinutes ??
            input.defaultRouteDurationMinutes ??
            rules.defaultRouteDurationMinutes,
          15,
        );

  if (input.returnTrip && input.returnAt) {
    return addMinutes(new Date(input.returnAt), tripDurationMinutes);
  }

  return addMinutes(pickupAt, tripDurationMinutes);
}

function resolveTransferOriginAddress(window: AvailabilityBookingWindow) {
  return window.dropoffAddress?.trim() || window.pickupAddress;
}

function resolveOccupiedStart(
  window: AvailabilityBookingWindow,
  rules: DispatchRules,
) {
  const override = applyDispatchOverride(rules, window.dispatchOverride ?? {});

  return addMinutes(window.pickupAt, -override.pickupBufferMinutes);
}

function resolveBufferedServiceEnd(
  window: AvailabilityBookingWindow,
  rules: DispatchRules,
) {
  const override = applyDispatchOverride(rules, window.dispatchOverride ?? {});

  return addMinutes(
    window.serviceEndAt,
    override.dropoffBufferMinutes,
  );
}

export function resolveOccupiedWindow(
  window: AvailabilityBookingWindow,
  rules: DispatchRules,
) {
  return {
    endAt: resolveBufferedServiceEnd(window, rules),
    startAt: resolveOccupiedStart(window, rules),
  };
}

async function resolveTurnaroundRequirement(
  current: AvailabilityBookingWindow,
  next: AvailabilityBookingWindow,
  currentRules: DispatchRules,
  nextRules: DispatchRules = currentRules,
) {
  const currentOverride = applyDispatchOverride(
    currentRules,
    current.dispatchOverride ?? {},
  );
  const nextOverride = applyDispatchOverride(nextRules, next.dispatchOverride ?? {});
  const estimatedTransferMinutes = await estimateDriveMinutes(
    resolveTransferOriginAddress(current),
    next.pickupAddress,
  );
  const transferMinutes = resolveTransferMinutes({
    estimatedTransferMinutes,
    rules: {
      fallbackTransferMinutes: currentRules.fallbackTransferMinutes,
      minimumTransferMinutes: currentOverride.minimumTransferMinutes,
    },
    transferOverrideMinutes: currentOverride.transferMinutes,
  });
  const requiredGapMinutes = Math.max(
    currentOverride.dropoffBufferMinutes,
    transferMinutes,
    nextOverride.pickupBufferMinutes,
  );

  return {
    availableGapMinutes: Math.round(
      (next.pickupAt.getTime() - current.serviceEndAt.getTime()) / 60000,
    ),
    requiredGapMinutes,
    transferMinutes,
  } satisfies AvailabilityTurnaroundRequirement;
}

export async function hasSchedulingConflict(
  existing: AvailabilityBookingWindow,
  candidate: AvailabilityBookingWindow,
  existingRules: DispatchRules,
  candidateRules: DispatchRules = existingRules,
) {
  if (
    existing.pickupAt < candidate.serviceEndAt &&
    existing.serviceEndAt > candidate.pickupAt
  ) {
    return true;
  }

  if (existing.serviceEndAt <= candidate.pickupAt) {
    const requirement = await resolveTurnaroundRequirement(
      existing,
      candidate,
      existingRules,
      candidateRules,
    );

    return requirement.availableGapMinutes < requirement.requiredGapMinutes;
  }

  if (candidate.serviceEndAt <= existing.pickupAt) {
    const requirement = await resolveTurnaroundRequirement(
      candidate,
      existing,
      candidateRules,
      existingRules,
    );

    return requirement.availableGapMinutes < requirement.requiredGapMinutes;
  }

  return false;
}

export function hasBlockConflict(
  block: AvailabilityBlockWindow,
  candidate: AvailabilityBookingWindow,
  candidateRules: DispatchRules,
) {
  const candidateOccupiedStart = resolveOccupiedStart(candidate, candidateRules);
  const candidateBufferedEnd = resolveBufferedServiceEnd(candidate, candidateRules);

  return block.startAt < candidateBufferedEnd && block.endAt > candidateOccupiedStart;
}
