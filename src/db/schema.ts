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
    perMileRate: numeric("per_mile_rate", { precision: 10, scale: 2 }).notNull(),
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
    image: text("image").notNull(),
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
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  customerEmail: varchar("customer_email", { length: 160 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 64 }).notNull(),
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
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

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
  vehicleBlocks,
  siteSettings,
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
export type Booking = typeof bookings.$inferSelect;
export type VehicleBlock = typeof vehicleBlocks.$inferSelect;
