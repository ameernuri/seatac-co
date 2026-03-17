import { and, eq, inArray, isNull, or } from "drizzle-orm";

import { db } from "@/db/client";
import {
  vehicleSiteAssignments,
  vehicleSiteAvailabilityRules,
  vehicleSiteScheduleExceptions,
} from "@/db/schema";

export async function getVehicleAvailabilityScheduleByAssignmentIds(
  assignmentIds: string[],
) {
  if (assignmentIds.length === 0) {
    return new Map<
      string,
      {
        exceptions: typeof vehicleSiteScheduleExceptions.$inferSelect[];
        rules: typeof vehicleSiteAvailabilityRules.$inferSelect[];
      }
    >();
  }

  const assignments = await db
    .select()
    .from(vehicleSiteAssignments)
    .where(inArray(vehicleSiteAssignments.id, assignmentIds));
  const siteIds = Array.from(new Set(assignments.map((entry) => entry.siteId)));
  const ruleRows = await db
    .select()
    .from(vehicleSiteAvailabilityRules)
    .where(
      inArray(vehicleSiteAvailabilityRules.vehicleSiteAssignmentId, assignmentIds),
    );
  const exceptionRows =
    siteIds.length > 0
      ? await db
          .select()
          .from(vehicleSiteScheduleExceptions)
          .where(
            and(
              inArray(vehicleSiteScheduleExceptions.siteId, siteIds),
              or(
                inArray(vehicleSiteScheduleExceptions.vehicleSiteAssignmentId, assignmentIds),
                isNull(vehicleSiteScheduleExceptions.vehicleSiteAssignmentId),
              ),
            ),
          )
      : [];

  const rulesByAssignment = ruleRows.reduce<Map<string, typeof ruleRows>>((acc, row) => {
    const existing = acc.get(row.vehicleSiteAssignmentId) ?? [];
    existing.push(row);
    acc.set(row.vehicleSiteAssignmentId, existing);
    return acc;
  }, new Map());

  return assignments.reduce<
    Map<
      string,
      {
        exceptions: typeof vehicleSiteScheduleExceptions.$inferSelect[];
        rules: typeof vehicleSiteAvailabilityRules.$inferSelect[];
      }
    >
  >((acc, assignment) => {
    acc.set(assignment.id, {
      exceptions: exceptionRows.filter(
        (row) =>
          row.siteId === assignment.siteId &&
          (row.vehicleSiteAssignmentId === null ||
            row.vehicleSiteAssignmentId === assignment.id),
      ),
      rules: rulesByAssignment.get(assignment.id) ?? [],
    });
    return acc;
  }, new Map());
}

export async function getVehicleAvailabilityScheduleForSiteVehicle(params: {
  siteId: string;
  vehicleId: string;
}) {
  const assignment = await db.query.vehicleSiteAssignments.findFirst({
    where: (row, { and, eq }) =>
      and(eq(row.siteId, params.siteId), eq(row.vehicleId, params.vehicleId)),
  });

  if (!assignment) {
    return {
      exceptions: [],
      rules: [],
    };
  }

  const ruleRows = await db
    .select()
    .from(vehicleSiteAvailabilityRules)
    .where(
      inArray(vehicleSiteAvailabilityRules.vehicleSiteAssignmentId, [assignment.id]),
    );
  const exceptionRows = await db
    .select()
    .from(vehicleSiteScheduleExceptions)
    .where(
      and(
        eq(vehicleSiteScheduleExceptions.siteId, params.siteId),
        or(
          eq(vehicleSiteScheduleExceptions.vehicleSiteAssignmentId, assignment.id),
          isNull(vehicleSiteScheduleExceptions.vehicleSiteAssignmentId),
        ),
      ),
    );

  return {
    exceptions: exceptionRows,
    rules: ruleRows,
  };
}
