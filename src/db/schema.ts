import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: boolean("phone_number_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const sites = pgTable("sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  domain: varchar("domain", { length: 160 }).notNull().unique(),
  themeKey: varchar("theme_key", { length: 64 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    summary: text("summary").notNull(),
    passengersMin: integer("passengers_min").notNull().default(1),
    passengersMax: integer("passengers_max").notNull(),
    bagsMin: integer("bags_min").notNull().default(0),
    bagsMax: integer("bags_max").notNull(),
    quantity: integer("quantity").notNull().default(1),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    bagFee: numeric("bag_fee", { precision: 10, scale: 2 }),
    mileageFee: numeric("mileage_fee", { precision: 10, scale: 2 }),
    perMileRate: numeric("per_mile_rate", { precision: 10, scale: 2 }).notNull(),
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
    image: text("image").notNull(),
    passengerFee: numeric("passenger_fee", { precision: 10, scale: 2 }),
    displayOrder: integer("display_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    siteSlugIdx: uniqueIndex("vehicles_site_slug_idx").on(table.siteId, table.slug),
  }),
);

export const vehicleSiteAssignments = pgTable(
  "vehicle_site_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    vehicleSiteIdx: uniqueIndex("vehicle_site_assignments_vehicle_site_idx").on(
      table.vehicleId,
      table.siteId,
    ),
    siteLookupIdx: index("vehicle_site_assignments_site_lookup_idx").on(table.siteId),
  }),
);

export const vehicleSiteAvailabilityRules = pgTable(
  "vehicle_site_availability_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleSiteAssignmentId: uuid("vehicle_site_assignment_id")
      .notNull()
      .references(() => vehicleSiteAssignments.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    assignmentDayIdx: uniqueIndex(
      "vehicle_site_availability_rules_assignment_day_idx",
    ).on(table.vehicleSiteAssignmentId, table.dayOfWeek),
    assignmentLookupIdx: index(
      "vehicle_site_availability_rules_assignment_lookup_idx",
    ).on(table.vehicleSiteAssignmentId),
  }),
);

export const vehicleSiteScheduleExceptions = pgTable(
  "vehicle_site_schedule_exceptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    vehicleSiteAssignmentId: uuid("vehicle_site_assignment_id").references(
      () => vehicleSiteAssignments.id,
      { onDelete: "cascade" },
    ),
    label: varchar("label", { length: 160 }).notNull(),
    type: varchar("type", { length: 24 }).notNull(),
    recurrence: varchar("recurrence", { length: 24 }).notNull(),
    dayOfWeek: integer("day_of_week"),
    allDay: boolean("all_day").notNull().default(false),
    startAt: timestamp("start_at", { withTimezone: true }),
    endAt: timestamp("end_at", { withTimezone: true }),
    startTime: varchar("start_time", { length: 5 }),
    endTime: varchar("end_time", { length: 5 }),
    notes: text("notes"),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    assignmentLookupIdx: index(
      "vehicle_site_schedule_exceptions_assignment_lookup_idx",
    ).on(table.vehicleSiteAssignmentId),
    siteLookupIdx: index("vehicle_site_schedule_exceptions_site_lookup_idx").on(
      table.siteId,
    ),
  }),
);

export const vehicleUnits = pgTable(
  "vehicle_units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 96 }).notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    vehicleLabelIdx: uniqueIndex("vehicle_units_vehicle_label_idx").on(
      table.vehicleId,
      table.label,
    ),
  }),
);

export const chauffeurs = pgTable(
  "chauffeurs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 64 }),
    color: varchar("color", { length: 24 }).notNull().default("slate"),
    displayOrder: integer("display_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    siteNameIdx: uniqueIndex("chauffeurs_site_name_idx").on(table.siteId, table.name),
    siteLookupIdx: index("chauffeurs_site_lookup_idx").on(table.siteId, table.displayOrder),
  }),
);

export const routes = pgTable(
  "routes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    mode: varchar("mode", { length: 32 }).notNull(),
    origin: varchar("origin", { length: 160 }).notNull(),
    destination: varchar("destination", { length: 160 }).notNull(),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    mileage: numeric("mileage", { precision: 10, scale: 2 }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    siteSlugIdx: uniqueIndex("routes_site_slug_idx").on(table.siteId, table.slug),
  }),
);

export const hotels = pgTable(
  "hotels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 96 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    address: text("address").notNull(),
    neighborhood: varchar("neighborhood", { length: 96 }).notNull(),
    area: varchar("area", { length: 64 }).notNull(),
    summary: text("summary").notNull(),
    airportRouteSlug: varchar("airport_route_slug", { length: 64 }).notNull(),
    distanceMiles: numeric("distance_miles", { precision: 10, scale: 2 }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    priority: integer("priority").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    siteSlugIdx: uniqueIndex("hotels_site_slug_idx").on(table.siteId, table.slug),
    sitePriorityIdx: index("hotels_site_priority_idx").on(
      table.siteId,
      table.priority,
      table.name,
    ),
  }),
);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  reference: varchar("reference", { length: 20 }).notNull().unique(),
  status: varchar("status", { length: 24 }).notNull().default("pending"),
  serviceMode: varchar("service_mode", { length: 24 }).notNull(),
  tripType: varchar("trip_type", { length: 24 }).notNull(),
  routeName: varchar("route_name", { length: 160 }),
  pickupLabel: varchar("pickup_label", { length: 160 }).notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropoffLabel: varchar("dropoff_label", { length: 160 }),
  dropoffAddress: text("dropoff_address"),
  pickupAt: timestamp("pickup_at", { withTimezone: true }).notNull(),
  returnAt: timestamp("return_at", { withTimezone: true }),
  passengers: integer("passengers").notNull(),
  bags: integer("bags").notNull(),
  hoursRequested: integer("hours_requested"),
  customerUserId: text("customer_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  customerEmail: varchar("customer_email", { length: 160 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 64 }).notNull(),
  customerSmsOptIn: boolean("customer_sms_opt_in").notNull().default(false),
  customerSmsOptInAt: timestamp("customer_sms_opt_in_at", { withTimezone: true }),
  specialInstructions: text("special_instructions"),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  vehicleUnitId: uuid("vehicle_unit_id").references(() => vehicleUnits.id),
  vehicleName: varchar("vehicle_name", { length: 160 }).notNull(),
  vehicleUnitLabel: varchar("vehicle_unit_label", { length: 96 }),
  chauffeurId: uuid("chauffeur_id").references(() => chauffeurs.id),
  chauffeurName: varchar("chauffeur_name", { length: 160 }),
  dispatchOverride: jsonb("dispatch_override").notNull().default({}),
  extras: jsonb("extras").notNull().default([]),
  pricing: jsonb("pricing").notNull().default({}),
  subtotalCents: integer("subtotal_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  serviceEndAt: timestamp("service_end_at", { withTimezone: true }),
  paymentStatus: varchar("payment_status", { length: 24 })
    .notNull()
    .default("quote"),
  paymentMethod: varchar("payment_method", { length: 24 })
    .notNull()
    .default("dispatch"),
  paymentCheckoutSessionId: varchar("payment_checkout_session_id", {
    length: 255,
  }),
  paymentIntentId: varchar("payment_intent_id", { length: 255 }),
  paymentCollectedAt: timestamp("payment_collected_at", { withTimezone: true }),
  customerEmailConfirmationSentAt: timestamp("customer_email_confirmation_sent_at", {
    withTimezone: true,
  }),
  customerSmsConfirmationSentAt: timestamp("customer_sms_confirmation_sent_at", {
    withTimezone: true,
  }),
  dispatchEmailSentAt: timestamp("dispatch_email_sent_at", { withTimezone: true }),
  customerSmsReminderSentAt: timestamp("customer_sms_reminder_sent_at", {
    withTimezone: true,
  }),
  dispatchSmsSentAt: timestamp("dispatch_sms_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clientProfiles = pgTable(
  "client_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    phone: varchar("phone", { length: 64 }).notNull(),
    phoneNormalized: varchar("phone_normalized", { length: 32 }).notNull(),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    smsOptIn: boolean("sms_opt_in").notNull().default(false),
    smsOptInAt: timestamp("sms_opt_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    phoneNormalizedIdx: uniqueIndex("client_profiles_phone_normalized_idx").on(
      table.phoneNormalized,
    ),
  }),
);

export const clientPhoneVerificationChallenges = pgTable(
  "client_phone_verification_challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    purpose: varchar("purpose", { length: 32 }).notNull(),
    phoneNormalized: varchar("phone_normalized", { length: 32 }).notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    phonePurposeIdx: index("client_phone_verification_phone_purpose_idx").on(
      table.phoneNormalized,
      table.purpose,
      table.createdAt,
    ),
    expiresIdx: index("client_phone_verification_expires_idx").on(table.expiresAt),
  }),
);

export const vehicleBlocks = pgTable(
  "vehicle_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    vehicleUnitId: uuid("vehicle_unit_id")
      .notNull()
      .references(() => vehicleUnits.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull().default("maintenance"),
    reason: varchar("reason", { length: 160 }).notNull(),
    notes: text("notes"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    unitStartIdx: index("vehicle_blocks_unit_start_idx").on(
      table.vehicleUnitId,
      table.startAt,
    ),
    siteStartIdx: index("vehicle_blocks_site_start_idx").on(
      table.siteId,
      table.startAt,
    ),
  }),
);

export const callLogs = pgTable(
  "call_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    callSid: varchar("call_sid", { length: 64 }).notNull().unique(),
    accountSid: varchar("account_sid", { length: 64 }),
    siteId: uuid("site_id").references(() => sites.id, { onDelete: "set null" }),
    bookingId: uuid("booking_id").references(() => bookings.id, {
      onDelete: "set null",
    }),
    callerNumber: varchar("caller_number", { length: 64 }).notNull(),
    calledNumber: varchar("called_number", { length: 64 }).notNull(),
    displayNumber: varchar("display_number", { length: 64 }),
    direction: varchar("direction", { length: 32 }),
    status: varchar("status", { length: 32 }).notNull().default("incoming"),
    durationSeconds: integer("duration_seconds"),
    bookingReference: varchar("booking_reference", { length: 20 }),
    customerName: varchar("customer_name", { length: 160 }),
    customerPhone: varchar("customer_phone", { length: 64 }),
    notes: text("notes"),
    payload: jsonb("payload").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    createdIdx: index("call_logs_created_idx").on(table.createdAt),
    siteCreatedIdx: index("call_logs_site_created_idx").on(table.siteId, table.createdAt),
    callerIdx: index("call_logs_caller_idx").on(table.callerNumber, table.createdAt),
  }),
);

export const siteSettings = pgTable(
  "site_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 80 }).notNull(),
    value: jsonb("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    siteKeyIdx: uniqueIndex("site_settings_site_key_idx").on(table.siteId, table.key),
  }),
);

export const proofPersonas = pgTable(
  "proof_personas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personaKey: varchar("persona_key", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull().default("Unnamed persona"),
    role: varchar("role", { length: 96 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    sourceFilePath: varchar("source_file_path", { length: 700 }),
    sourceRef: varchar("source_ref", { length: 200 }),
    profileSummary: text("profile_summary"),
    profile: text("profile").notNull(),
    techSavvy: varchar("tech_savvy", { length: 64 }),
    usagePattern: text("usage_pattern"),
    goals: jsonb("goals").notNull().default([]),
    risks: jsonb("risks").notNull().default([]),
    metadata: jsonb("metadata").notNull().default({}),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    roleIdx: index("proof_personas_role_idx").on(table.role),
  }),
);

export const proofPersonaVersions = pgTable(
  "proof_persona_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proofPersonaId: uuid("proof_persona_id")
      .notNull()
      .references(() => proofPersonas.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    profile: text("profile"),
    techSavvy: varchar("tech_savvy", { length: 64 }),
    usagePattern: text("usage_pattern"),
    goals: text("goals"),
    painPoints: text("pain_points"),
    testScenarios: jsonb("test_scenarios").notNull().default([]),
    bodyMarkdown: text("body_markdown").notNull(),
    contentChecksum: varchar("content_checksum", { length: 128 }).notNull(),
    isCurrent: boolean("is_current").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    personaVersionIdx: uniqueIndex("proof_persona_versions_unique").on(
      table.proofPersonaId,
      table.versionNumber,
    ),
    personaCurrentIdx: index("proof_persona_versions_current_idx").on(
      table.proofPersonaId,
      table.isCurrent,
    ),
  }),
);

export const proofUseCases = pgTable(
  "proof_use_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ucKey: varchar("uc_key", { length: 64 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("candidate"),
    sourceFilePath: varchar("source_file_path", { length: 700 }),
    sourceRef: varchar("source_ref", { length: 200 }),
    summary: text("summary"),
    primaryPersonaId: uuid("primary_persona_id").references(() => proofPersonas.id, {
      onDelete: "set null",
    }),
    riskLevel: varchar("risk_level", { length: 24 }).notNull().default("medium"),
    domains: jsonb("domains").notNull().default([]),
    who: text("who").notNull().default(""),
    what: text("what").notNull().default(""),
    needs: jsonb("needs").notNull().default([]),
    scenario: text("scenario").notNull().default(""),
    goal: text("goal").notNull(),
    preconditions: jsonb("preconditions").notNull().default([]),
    successPath: jsonb("success_path").notNull().default([]),
    failureModes: jsonb("failure_modes").notNull().default([]),
    canonicalSagaKey: varchar("canonical_saga_key", { length: 64 }),
    metadata: jsonb("metadata").notNull().default({}),
    latestRunStatus: varchar("latest_run_status", { length: 24 }),
    lastProvedAt: timestamp("last_proved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    personaIdx: index("proof_use_cases_persona_idx").on(table.primaryPersonaId),
    statusIdx: index("proof_use_cases_status_idx").on(table.status, table.riskLevel),
  }),
);

export const proofUseCaseVersions = pgTable(
  "proof_use_case_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proofUseCaseId: uuid("proof_use_case_id")
      .notNull()
      .references(() => proofUseCases.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    summary: text("summary"),
    bodyMarkdown: text("body_markdown").notNull(),
    extractedNeeds: jsonb("extracted_needs").notNull().default([]),
    extractedScenario: text("extracted_scenario"),
    contentChecksum: varchar("content_checksum", { length: 128 }).notNull(),
    isCurrent: boolean("is_current").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    useCaseVersionIdx: uniqueIndex("proof_use_case_versions_unique").on(
      table.proofUseCaseId,
      table.versionNumber,
    ),
    useCaseCurrentIdx: index("proof_use_case_versions_current_idx").on(
      table.proofUseCaseId,
      table.isCurrent,
    ),
  }),
);

export const proofSagas = pgTable(
  "proof_sagas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sagaKey: varchar("saga_key", { length: 64 }).notNull().unique(),
    ucId: uuid("uc_id")
      .notNull()
      .references(() => proofUseCases.id, { onDelete: "cascade" }),
    personaId: uuid("persona_id").references(() => proofPersonas.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    depth: varchar("depth", { length: 24 }).notNull().default("smoke"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    specVersion: varchar("spec_version", { length: 40 }).notNull().default("proof.saga.v1"),
    sourceUseCaseRef: varchar("source_use_case_ref", { length: 80 }),
    sourcePersonaRef: varchar("source_persona_ref", { length: 120 }),
    sourceUseCaseFile: varchar("source_use_case_file", { length: 700 }),
    sourcePersonaFile: varchar("source_persona_file", { length: 700 }),
    specFilePath: varchar("spec_file_path", { length: 700 }),
    specChecksum: varchar("spec_checksum", { length: 128 }),
    metadata: jsonb("metadata").notNull().default({}),
    tags: jsonb("tags").notNull().default([]),
    spec: jsonb("spec").notNull().default({}),
    lastRunStatus: varchar("last_run_status", { length: 24 }),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ucIdx: index("proof_sagas_uc_idx").on(table.ucId, table.status),
    personaIdx: index("proof_sagas_persona_idx").on(table.personaId),
  }),
);

export const proofSagaLinks = pgTable(
  "proof_saga_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proofSagaId: uuid("proof_saga_id")
      .notNull()
      .references(() => proofSagas.id, { onDelete: "cascade" }),
    proofUseCaseVersionId: uuid("proof_use_case_version_id").references(
      () => proofUseCaseVersions.id,
      { onDelete: "cascade" },
    ),
    proofPersonaVersionId: uuid("proof_persona_version_id").references(
      () => proofPersonaVersions.id,
      { onDelete: "cascade" },
    ),
    relationRole: varchar("relation_role", { length: 60 }).notNull().default("primary"),
    weight: integer("weight").notNull().default(1),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sagaLinkUniqueIdx: uniqueIndex("proof_saga_links_unique").on(
      table.proofSagaId,
      table.proofUseCaseVersionId,
      table.proofPersonaVersionId,
      table.relationRole,
    ),
    sagaLinkSagaIdx: index("proof_saga_links_saga_idx").on(table.proofSagaId),
  }),
);

export const proofRuns = pgTable(
  "proof_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runKey: varchar("run_key", { length: 96 }).notNull().unique(),
    sagaId: uuid("saga_id").references(() => proofSagas.id, {
      onDelete: "set null",
    }),
    ucId: uuid("uc_id").references(() => proofUseCases.id, {
      onDelete: "set null",
    }),
    personaId: uuid("persona_id").references(() => proofPersonas.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 24 }).notNull().default("queued"),
    triggerSource: varchar("trigger_source", { length: 32 }).notNull().default("manual"),
    baseUrl: varchar("base_url", { length: 255 }),
    targetKey: varchar("target_key", { length: 80 }),
    targetEnvironment: varchar("target_environment", { length: 32 }),
    targetType: varchar("target_type", { length: 32 }),
    gitHead: varchar("git_head", { length: 64 }),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    errorSummary: text("error_summary"),
    evidence: jsonb("evidence").notNull().default({}),
    metrics: jsonb("metrics").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    sagaIdx: index("proof_runs_saga_idx").on(table.sagaId, table.startedAt),
    statusIdx: index("proof_runs_status_idx").on(table.status, table.startedAt),
    targetIdx: index("proof_runs_target_idx").on(
      table.targetEnvironment,
      table.targetType,
      table.startedAt,
    ),
  }),
);

export const proofTargets = pgTable(
  "proof_targets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    targetKey: varchar("target_key", { length: 80 }).notNull().unique(),
    label: varchar("label", { length: 160 }).notNull(),
    environment: varchar("environment", { length: 32 }).notNull().default("local"),
    targetType: varchar("target_type", { length: 32 }).notNull().default("public"),
    siteSlug: varchar("site_slug", { length: 64 }),
    baseUrl: varchar("base_url", { length: 255 }).notNull(),
    capabilities: jsonb("capabilities").notNull().default([]),
    active: boolean("active").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
    scheduleEnabled: boolean("schedule_enabled").notNull().default(false),
    releaseBlocking: boolean("release_blocking").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    envTypeIdx: index("proof_targets_env_type_idx").on(
      table.environment,
      table.targetType,
      table.active,
    ),
  }),
);

export const proofRunSteps = pgTable(
  "proof_run_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    runId: uuid("run_id")
      .notNull()
      .references(() => proofRuns.id, { onDelete: "cascade" }),
    stepKey: varchar("step_key", { length: 80 }).notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    position: integer("position").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    request: jsonb("request").notNull().default({}),
    responseSummary: jsonb("response_summary").notNull().default({}),
    evidence: jsonb("evidence").notNull().default({}),
    failure: jsonb("failure").notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    runPositionIdx: uniqueIndex("proof_run_steps_run_position_idx").on(
      table.runId,
      table.position,
    ),
    runStatusIdx: index("proof_run_steps_run_status_idx").on(table.runId, table.status),
  }),
);

export const proofOodaLoops = pgTable(
  "proof_ooda_loops",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loopKey: varchar("loop_key", { length: 64 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    objective: text("objective").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    currentPhase: varchar("current_phase", { length: 24 }).notNull().default("observe"),
    priority: integer("priority").notNull().default(1),
    domains: jsonb("domains").notNull().default([]),
    focus: jsonb("focus").notNull().default({}),
    currentBlockers: jsonb("current_blockers").notNull().default([]),
    latestFailures: jsonb("latest_failures").notNull().default([]),
    hypotheses: jsonb("hypotheses").notNull().default([]),
    decisions: jsonb("decisions").notNull().default([]),
    nextActions: jsonb("next_actions").notNull().default([]),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    statusIdx: index("proof_ooda_loops_status_idx").on(table.status, table.priority),
  }),
);

export const proofOodaEntries = pgTable(
  "proof_ooda_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loopId: uuid("loop_id")
      .notNull()
      .references(() => proofOodaLoops.id, { onDelete: "cascade" }),
    ucId: uuid("uc_id").references(() => proofUseCases.id, {
      onDelete: "set null",
    }),
    sagaId: uuid("saga_id").references(() => proofSagas.id, {
      onDelete: "set null",
    }),
    runId: uuid("run_id").references(() => proofRuns.id, {
      onDelete: "set null",
    }),
    phase: varchar("phase", { length: 24 }).notNull(),
    entryType: varchar("entry_type", { length: 32 }).notNull().default("observation"),
    status: varchar("status", { length: 24 }).notNull().default("open"),
    severity: varchar("severity", { length: 24 }).notNull().default("medium"),
    title: varchar("title", { length: 160 }).notNull(),
    note: text("note").notNull(),
    fixLabel: varchar("fix_label", { length: 160 }),
    fixOwner: varchar("fix_owner", { length: 160 }),
    fixStatus: varchar("fix_status", { length: 32 }),
    fixUrl: text("fix_url"),
    resolutionNote: text("resolution_note"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    evidence: jsonb("evidence").notNull().default({}),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    loopPhaseIdx: index("proof_ooda_entries_loop_phase_idx").on(table.loopId, table.phase),
    runIdx: index("proof_ooda_entries_run_idx").on(table.runId),
  }),
);

export const seoProjects = pgTable(
  "seo_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    siteSlugIdx: uniqueIndex("seo_projects_site_slug_idx").on(table.siteId, table.slug),
    siteStatusIdx: index("seo_projects_site_status_idx").on(table.siteId, table.status),
  }),
);

export const seoPages = pgTable(
  "seo_pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    pageType: varchar("page_type", { length: 48 }).notNull(),
    keywordCluster: varchar("keyword_cluster", { length: 96 }),
    title: text("title"),
    metaDescription: text("meta_description"),
    canonicalUrl: text("canonical_url"),
    indexable: boolean("indexable").notNull().default(true),
    active: boolean("active").notNull().default(true),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectUrlIdx: uniqueIndex("seo_pages_project_url_idx").on(table.projectId, table.url),
    projectTypeIdx: index("seo_pages_project_type_idx").on(table.projectId, table.pageType),
    clusterIdx: index("seo_pages_cluster_idx").on(table.keywordCluster),
  }),
);

export const seoPageAudits = pgTable(
  "seo_page_audits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => seoPages.id, { onDelete: "cascade" }),
    auditedAt: timestamp("audited_at", { withTimezone: true }).notNull().defaultNow(),
    source: varchar("source", { length: 32 }).notNull().default("manual"),
    statusCode: integer("status_code"),
    lighthouseSeoScore: integer("lighthouse_seo_score"),
    lighthousePerformanceScore: integer("lighthouse_performance_score"),
    lighthouseAccessibilityScore: integer("lighthouse_accessibility_score"),
    hasTitle: boolean("has_title"),
    hasMetaDescription: boolean("has_meta_description"),
    hasCanonical: boolean("has_canonical"),
    hasValidStructuredData: boolean("has_valid_structured_data"),
    indexable: boolean("indexable"),
    h1Count: integer("h1_count"),
    internalLinksIn: integer("internal_links_in"),
    internalLinksOut: integer("internal_links_out"),
    wordCount: integer("word_count"),
    imageCount: integer("image_count"),
    lcpMs: integer("lcp_ms"),
    fcpMs: integer("fcp_ms"),
    cls: numeric("cls", { precision: 8, scale: 4 }),
    notes: jsonb("notes").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pageAuditTimeIdx: index("seo_page_audits_page_time_idx").on(table.pageId, table.auditedAt),
  }),
);

export const seoKeywords = pgTable(
  "seo_keywords",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    targetPageId: uuid("target_page_id").references(() => seoPages.id, {
      onDelete: "set null",
    }),
    keyword: varchar("keyword", { length: 320 }).notNull(),
    cluster: varchar("cluster", { length: 96 }),
    intent: varchar("intent", { length: 48 }),
    location: varchar("location", { length: 96 }).notNull().default("Seattle, WA"),
    device: varchar("device", { length: 24 }).notNull().default("desktop"),
    active: boolean("active").notNull().default(true),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectKeywordIdx: uniqueIndex("seo_keywords_project_keyword_idx").on(
      table.projectId,
      table.keyword,
      table.location,
      table.device,
    ),
    clusterIdx: index("seo_keywords_cluster_idx").on(table.projectId, table.cluster),
  }),
);

export const seoKeywordRankSnapshots = pgTable(
  "seo_keyword_rank_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    keywordId: uuid("keyword_id")
      .notNull()
      .references(() => seoKeywords.id, { onDelete: "cascade" }),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    rank: integer("rank"),
    previousRank: integer("previous_rank"),
    searchEngine: varchar("search_engine", { length: 24 }).notNull().default("google"),
    source: varchar("source", { length: 32 }).notNull().default("manual"),
    targetUrlSeen: text("target_url_seen"),
    serpFeatures: jsonb("serp_features").notNull().default([]),
    notes: jsonb("notes").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    keywordCapturedIdx: index("seo_keyword_rank_snapshots_keyword_time_idx").on(
      table.keywordId,
      table.capturedAt,
    ),
  }),
);

export const seoSearchConsoleSnapshots = pgTable(
  "seo_search_console_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    pageId: uuid("page_id").references(() => seoPages.id, { onDelete: "set null" }),
    keywordId: uuid("keyword_id").references(() => seoKeywords.id, { onDelete: "set null" }),
    snapshotDate: timestamp("snapshot_date", { withTimezone: true }).notNull(),
    url: text("url"),
    query: text("query"),
    clicks: integer("clicks").notNull().default(0),
    impressions: integer("impressions").notNull().default(0),
    ctr: numeric("ctr", { precision: 8, scale: 4 }),
    position: numeric("position", { precision: 8, scale: 2 }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectDateIdx: index("seo_search_console_snapshots_project_date_idx").on(
      table.projectId,
      table.snapshotDate,
    ),
    pageDateIdx: index("seo_search_console_snapshots_page_date_idx").on(
      table.pageId,
      table.snapshotDate,
    ),
    keywordDateIdx: index("seo_search_console_snapshots_keyword_date_idx").on(
      table.keywordId,
      table.snapshotDate,
    ),
  }),
);

export const seoChangeLogs = pgTable(
  "seo_change_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    pageId: uuid("page_id").references(() => seoPages.id, { onDelete: "set null" }),
    keywordId: uuid("keyword_id").references(() => seoKeywords.id, { onDelete: "set null" }),
    changeType: varchar("change_type", { length: 48 }).notNull(),
    workflowStatus: varchar("workflow_status", { length: 24 }).notNull().default("planned"),
    owner: varchar("owner", { length: 120 }),
    summary: varchar("summary", { length: 240 }).notNull(),
    details: text("details"),
    gitRef: varchar("git_ref", { length: 64 }),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectChangedIdx: index("seo_change_logs_project_changed_idx").on(
      table.projectId,
      table.changedAt,
    ),
    pageChangedIdx: index("seo_change_logs_page_changed_idx").on(table.pageId, table.changedAt),
  }),
);

export const seoChangeLogRevisions = pgTable(
  "seo_change_log_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    changeLogId: uuid("change_log_id")
      .notNull()
      .references(() => seoChangeLogs.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    revisionNumber: integer("revision_number").notNull(),
    workflowStatus: varchar("workflow_status", { length: 24 }).notNull(),
    owner: varchar("owner", { length: 120 }),
    summary: varchar("summary", { length: 240 }).notNull(),
    details: text("details"),
    gitRef: varchar("git_ref", { length: 64 }),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    changeRevisionIdx: uniqueIndex("seo_change_log_revisions_change_revision_idx").on(
      table.changeLogId,
      table.revisionNumber,
    ),
    projectCreatedIdx: index("seo_change_log_revisions_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
  }),
);

export const seoExperiments = pgTable(
  "seo_experiments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    hypothesis: text("hypothesis").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("planned"),
    owner: varchar("owner", { length: 120 }),
    successMetric: varchar("success_metric", { length: 160 }),
    targetPageIds: jsonb("target_page_ids").notNull().default([]),
    targetKeywordIds: jsonb("target_keyword_ids").notNull().default([]),
    notes: jsonb("notes").notNull().default({}),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectSlugIdx: uniqueIndex("seo_experiments_project_slug_idx").on(
      table.projectId,
      table.slug,
    ),
    projectStatusIdx: index("seo_experiments_project_status_idx").on(
      table.projectId,
      table.status,
    ),
  }),
);

export const seoExperimentRevisions = pgTable(
  "seo_experiment_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => seoExperiments.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    revisionNumber: integer("revision_number").notNull(),
    status: varchar("status", { length: 24 }).notNull(),
    owner: varchar("owner", { length: 120 }),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    hypothesis: text("hypothesis").notNull(),
    successMetric: varchar("success_metric", { length: 160 }),
    notes: jsonb("notes").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    experimentRevisionIdx: uniqueIndex("seo_experiment_revisions_experiment_revision_idx").on(
      table.experimentId,
      table.revisionNumber,
    ),
    projectCreatedIdx: index("seo_experiment_revisions_project_created_idx").on(
      table.projectId,
      table.createdAt,
    ),
  }),
);

export const seoLoopRuns = pgTable(
  "seo_loop_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => seoProjects.id, { onDelete: "cascade" }),
    runType: varchar("run_type", { length: 48 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("running"),
    summary: varchar("summary", { length: 240 }),
    details: text("details"),
    metadata: jsonb("metadata").notNull().default({}),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    projectStartedIdx: index("seo_loop_runs_project_started_idx").on(
      table.projectId,
      table.startedAt,
    ),
    projectTypeStartedIdx: index("seo_loop_runs_project_type_started_idx").on(
      table.projectId,
      table.runType,
      table.startedAt,
    ),
  }),
);

export const schema = {
  user: users,
  session: sessions,
  account: accounts,
  verification: verifications,
  sites,
  vehicles,
  vehicleSiteAssignments,
  vehicleSiteAvailabilityRules,
  vehicleSiteScheduleExceptions,
  vehicleUnits,
  chauffeurs,
  routes,
  bookings,
  clientProfiles,
  clientPhoneVerificationChallenges,
  vehicleBlocks,
  callLogs,
  siteSettings,
  proofPersonas,
  proofPersonaVersions,
  proofUseCases,
  proofUseCaseVersions,
  proofSagas,
  proofSagaLinks,
  proofRuns,
  proofTargets,
  proofRunSteps,
  proofOodaLoops,
  proofOodaEntries,
  seoProjects,
  seoPages,
  seoPageAudits,
  seoKeywords,
  seoKeywordRankSnapshots,
  seoSearchConsoleSnapshots,
  seoChangeLogs,
  seoChangeLogRevisions,
  seoExperiments,
  seoExperimentRevisions,
  seoLoopRuns,
};

export type Site = typeof sites.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type VehicleSiteAssignment = typeof vehicleSiteAssignments.$inferSelect;
export type VehicleSiteAvailabilityRule =
  typeof vehicleSiteAvailabilityRules.$inferSelect;
export type VehicleSiteScheduleException =
  typeof vehicleSiteScheduleExceptions.$inferSelect;
export type VehicleUnit = typeof vehicleUnits.$inferSelect;
export type Chauffeur = typeof chauffeurs.$inferSelect;
export type Route = typeof routes.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type ClientProfile = typeof clientProfiles.$inferSelect;
export type ClientPhoneVerificationChallenge =
  typeof clientPhoneVerificationChallenges.$inferSelect;
export type VehicleBlock = typeof vehicleBlocks.$inferSelect;
export type CallLog = typeof callLogs.$inferSelect;
export type ProofPersona = typeof proofPersonas.$inferSelect;
export type ProofPersonaVersion = typeof proofPersonaVersions.$inferSelect;
export type ProofUseCase = typeof proofUseCases.$inferSelect;
export type ProofUseCaseVersion = typeof proofUseCaseVersions.$inferSelect;
export type ProofSaga = typeof proofSagas.$inferSelect;
export type ProofSagaLink = typeof proofSagaLinks.$inferSelect;
export type ProofRun = typeof proofRuns.$inferSelect;
export type ProofTarget = typeof proofTargets.$inferSelect;
export type ProofRunStep = typeof proofRunSteps.$inferSelect;
export type ProofOodaLoop = typeof proofOodaLoops.$inferSelect;
export type ProofOodaEntry = typeof proofOodaEntries.$inferSelect;
export type SeoProject = typeof seoProjects.$inferSelect;
export type SeoPage = typeof seoPages.$inferSelect;
export type SeoPageAudit = typeof seoPageAudits.$inferSelect;
export type SeoKeyword = typeof seoKeywords.$inferSelect;
export type SeoKeywordRankSnapshot = typeof seoKeywordRankSnapshots.$inferSelect;
export type SeoSearchConsoleSnapshot = typeof seoSearchConsoleSnapshots.$inferSelect;
export type SeoChangeLog = typeof seoChangeLogs.$inferSelect;
export type SeoExperiment = typeof seoExperiments.$inferSelect;
export type SeoLoopRun = typeof seoLoopRuns.$inferSelect;
