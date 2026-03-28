export type ProofAssertion =
  | { path: string; truthy: true }
  | { path: string; equals: string | number | boolean | null }
  | { path: string; includes: string }
  | { path: string; gte: number }
  | { path: string; lte: number };

export type ProofStepCapture = {
  as: string;
  from: string;
};

export type ProofHttpStep = {
  key: string;
  kind: "http";
  title: string;
  method: "GET" | "POST";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  expectStatus: number | number[];
  assertions?: ProofAssertion[];
  capture?: ProofStepCapture[];
};

export type ProofDbQueryStep = {
  key: string;
  kind: "dbQuery";
  title: string;
  sql: string;
  assertions?: ProofAssertion[];
  capture?: ProofStepCapture[];
};

export type ProofDbExecStep = {
  key: string;
  kind: "dbExec";
  title: string;
  sql: string;
  assertions?: ProofAssertion[];
  capture?: ProofStepCapture[];
};

export type ProofBrowserStep = {
  key: string;
  kind: "browser";
  title: string;
  scenario: "seatacReserveToCheckout" | "adminProofConsole";
  assertions?: ProofAssertion[];
  capture?: ProofStepCapture[];
};

export type ProofDomainStep = {
  key: string;
  kind: "domain";
  title: string;
  operation: "createBookingDraft";
  payload: unknown;
  expectErrorIncludes?: string;
  assertions?: ProofAssertion[];
  capture?: ProofStepCapture[];
};

export type ProofSagaStep =
  | ProofHttpStep
  | ProofDbQueryStep
  | ProofDbExecStep
  | ProofBrowserStep
  | ProofDomainStep;

export type ProofSagaSpec = {
  siteSlug: string;
  summary: string;
  targetType?: "public" | "admin";
  requiresCapabilities?: string[];
  steps: ProofSagaStep[];
};

export type ProofPersonaSeed = {
  personaKey: string;
  name: string;
  role: string;
  profile: string;
  profileSummary: string;
  techSavvy: string;
  usagePattern: string;
  goals: string[];
  risks: string[];
  sourceFilePath: string;
  sourceRef: string;
  testScenarios: string[];
  metadata?: Record<string, unknown>;
};

export type ProofUseCaseSeed = {
  ucKey: string;
  title: string;
  summary: string;
  status: "candidate" | "active" | "proven" | "fragile";
  personaKey: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  domains: string[];
  who: string;
  what: string;
  needs: string[];
  scenario: string;
  goal: string;
  preconditions: string[];
  successPath: string[];
  failureModes: string[];
  canonicalSagaKey: string;
  sourceFilePath: string;
  sourceRef: string;
  metadata?: Record<string, unknown>;
};

export type ProofSagaSeed = {
  sagaKey: string;
  ucKey: string;
  personaKey: string;
  title: string;
  description: string;
  depth: "smoke" | "regression" | "transaction";
  status: "active" | "staged" | "paused";
  tags: string[];
  spec: ProofSagaSpec;
  metadata?: Record<string, unknown>;
};

export type ProofLoopSeed = {
  loopKey: string;
  title: string;
  objective: string;
  status: "active" | "staged" | "paused";
  currentPhase: "observe" | "orient" | "decide" | "act";
  priority: number;
  domains: string[];
  focus: {
    sagaKeys: string[];
    ucKeys: string[];
  };
  currentBlockers: string[];
  hypotheses: string[];
  decisions: string[];
  nextActions: string[];
};

const PROOF_USE_CASES_FILE = "docs/seatac-proof-use-cases.md";
const PROOF_PERSONAS_FILE = "docs/seatac-proof-personas.md";

export const proofPersonas: ProofPersonaSeed[] = [
  {
    personaKey: "airport-traveler",
    name: "Airport traveler",
    role: "Airport traveler",
    profile:
      "A direct Sea-Tac customer who wants a fast, trustworthy booking flow with no dispatch surprises.",
    profileSummary:
      "A direct Sea-Tac customer who wants a fast, trustworthy booking flow and only valid inventory.",
    techSavvy: "Medium",
    usagePattern: "Short visits, mostly mobile, usually one booking at a time around real travel plans.",
    goals: [
      "Get a vehicle quote fast",
      "Only see valid inventory",
      "Know that pickup time is realistic",
    ],
    risks: [
      "Past-time bookings slipping through",
      "Inventory shown that dispatch cannot actually cover",
    ],
    sourceFilePath: PROOF_PERSONAS_FILE,
    sourceRef: "P-001",
    testScenarios: [
      "Future availability",
      "Past-time rejection",
      "Browser funnel to checkout",
    ],
  },
  {
    personaKey: "executive-assistant",
    name: "Executive assistant",
    role: "Executive assistant",
    profile:
      "A scheduler booking rides for executives who needs guardrails more than flexibility.",
    profileSummary:
      "A scheduler booking for someone else who values clear rules and predictable outcomes.",
    techSavvy: "Medium-High",
    usagePattern: "Desktop-heavy, time-pressured, often booking for other people with exact constraints.",
    goals: [
      "Book future airport transfers without dead ends",
      "See clear reasons when service cannot be offered",
    ],
    risks: [
      "Checkout flow accepts impossible trip times",
      "No explanation when cars are unavailable",
    ],
    sourceFilePath: PROOF_PERSONAS_FILE,
    sourceRef: "P-002",
    testScenarios: [
      "Outside-hours blocking",
      "Valid draft creation",
      "Reserve-success honesty",
    ],
  },
  {
    personaKey: "dispatcher",
    name: "Dispatcher",
    role: "Dispatcher",
    profile:
      "An operator who trusts the dashboard only if bookings and guardrails reflect real inventory.",
    profileSummary:
      "An operator who only trusts the system when public booking and dispatch share one fleet truth.",
    techSavvy: "Medium",
    usagePattern: "Checks the board throughout the day and reacts quickly when timing or inventory looks wrong.",
    goals: [
      "See that the public funnel respects fleet constraints",
      "Track failures quickly and turn them into loop actions",
    ],
    risks: [
      "Silent regressions in guardrails",
      "Operational truth living outside the control plane",
    ],
    sourceFilePath: PROOF_PERSONAS_FILE,
    sourceRef: "P-003",
    testScenarios: [
      "Ops visibility",
      "Overlapping inventory rejection",
      "Admin proof console access",
    ],
  },
  {
    personaKey: "revenue-owner",
    name: "Revenue owner",
    role: "Revenue owner",
    profile:
      "A founder checking whether the booking funnel is healthy enough to trust paid traffic and partnerships.",
    profileSummary:
      "A founder or operator deciding whether the funnel is healthy enough to support growth.",
    techSavvy: "Medium",
    usagePattern: "Periodic executive review of funnel health, release readiness, and monetization risk.",
    goals: [
      "Know which core truths are currently passing",
      "See fragile or failing proofs before pushing marketing",
    ],
    risks: [
      "Running campaigns against a broken funnel",
      "Learning about core failures from customers instead of the loop",
    ],
    sourceFilePath: PROOF_PERSONAS_FILE,
    sourceRef: "P-004",
    testScenarios: [
      "Payment-state confirmation",
      "Checkout session creation",
      "Real checkout settlement",
    ],
  },
];

export const proofUseCases: ProofUseCaseSeed[] = [
  {
    ucKey: "uc-seatac-future-availability",
    title: "Airport traveler can price a future Sea-Tac to Bellevue ride",
    summary:
      "A traveler entering a valid future airport transfer should see live vehicle options before committing.",
    status: "active",
    personaKey: "airport-traveler",
    riskLevel: "critical",
    domains: ["booking", "availability", "seatac_co"],
    who: "Airport traveler planning a future Sea-Tac pickup.",
    what: "Prices a point-to-point airport transfer before committing to checkout.",
    needs: [
      "Simple route-first quote flow",
      "Live vehicle inventory for the chosen window",
      "Vehicle options before personal/payment commitment",
    ],
    scenario:
      "A traveler planning ahead chooses Sea-Tac Airport to Bellevue, enters a realistic future pickup, and expects to see actual vehicles they can book right now.",
    goal:
      "An airport traveler planning ahead can request a future Sea-Tac transfer and see live bookable inventory.",
    preconditions: [
      "Seatac site data is seeded",
      "Vehicles are active for seatac_co",
      "The public app is reachable",
    ],
    successPath: [
      "User requests a future Sea-Tac to Bellevue ride",
      "Availability endpoint returns 200",
      "At least one vehicle remains selectable",
    ],
    failureModes: [
      "No active inventory returned for a healthy future slot",
      "Availability endpoint is down or malformed",
    ],
    canonicalSagaKey: "saga-seatac-future-availability",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-001",
  },
  {
    ucKey: "uc-seatac-past-booking-rejected",
    title: "Traveler is blocked from selecting a pickup time in the past",
    summary:
      "The booking funnel should refuse impossible dates before quote or checkout.",
    status: "active",
    personaKey: "airport-traveler",
    riskLevel: "critical",
    domains: ["booking", "guardrails", "seatac_co"],
    who: "Airport traveler choosing a pickup time.",
    what: "Attempts to book a transfer that would already be in the past.",
    needs: [
      "Hard rejection of impossible times",
      "Clear explanation before quote or checkout",
    ],
    scenario:
      "A traveler opens the reserve flow late and accidentally chooses a pickup time that has already passed. The system should block the request immediately instead of letting the user continue.",
    goal: "The funnel must never accept a booking window in the past.",
    preconditions: [
      "The public app is reachable",
      "Booking guardrails are loaded for seatac_co",
    ],
    successPath: [
      "User requests a past pickup time",
      "Availability returns 400 with a clear guardrail error",
    ],
    failureModes: [
      "Past time accepted",
      "Past time rejected without a useful error",
    ],
    canonicalSagaKey: "saga-seatac-past-booking-rejected",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-002",
  },
  {
    ucKey: "uc-seatac-outside-hours-blocked",
    title: "Executive assistant learns the trip is outside operating hours before vehicle selection",
    summary:
      "An executive assistant should get immediate scheduling feedback before they waste time in vehicle selection.",
    status: "active",
    personaKey: "executive-assistant",
    riskLevel: "high",
    domains: ["booking", "guardrails", "seatac_co"],
    who: "Executive assistant booking on behalf of a passenger.",
    what: "Checks a pickup that falls outside the operating window for the site.",
    needs: [
      "Immediate scheduling feedback",
      "Operating-hours explanation before vehicle selection",
    ],
    scenario:
      "An assistant tries to arrange a very early airport pickup for an executive. Before they waste time entering contact details, the system should explain that the requested window is outside service hours.",
    goal: "A pickup outside operating hours must be blocked with a reason before vehicle choice.",
    preconditions: [
      "Operating hours are configured on the site",
      "The public app is reachable",
    ],
    successPath: [
      "User requests a 2 AM pickup",
      "The app returns a 400 guardrail error naming the operating window",
    ],
    failureModes: [
      "Outside-hours request reaches vehicle selection",
      "No explanation is returned",
    ],
    canonicalSagaKey: "saga-seatac-outside-hours-blocked",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-003",
  },
  {
    ucKey: "uc-seatac-stripe-webhook-guard",
    title: "Platform rejects forged Stripe payment callbacks",
    summary:
      "The payment boundary must reject unsigned or forged Stripe webhook traffic.",
    status: "active",
    personaKey: "dispatcher",
    riskLevel: "high",
    domains: ["payments", "security", "seatac_co"],
    who: "Platform operator responsible for payment correctness.",
    what: "Needs the Stripe webhook boundary to reject forged payment callbacks.",
    needs: [
      "Signature validation on inbound Stripe events",
      "No booking mutation on unsafe traffic",
    ],
    scenario:
      "A bad actor or buggy integration posts unsigned webhook payloads to the payment endpoint. The system must reject them cleanly and leave booking state untouched.",
    goal: "Webhook endpoints must reject missing Stripe signatures.",
    preconditions: [
      "The public app is reachable",
      "The webhook endpoint is deployed",
    ],
    successPath: [
      "Unsigned webhook request is sent",
      "Endpoint returns 400",
    ],
    failureModes: [
      "Unsigned webhook accepted",
      "Security check regresses silently",
    ],
    canonicalSagaKey: "saga-seatac-stripe-webhook-guard",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-004",
  },
  {
    ucKey: "uc-seatac-ops-visibility",
    title: "Dispatcher can trust the loop's view of the live Seatac fleet",
    summary:
      "The proof system should query the same fleet truth that dispatch uses.",
    status: "active",
    personaKey: "revenue-owner",
    riskLevel: "medium",
    domains: ["ops", "control-plane", "seatac_co"],
    who: "Dispatcher or operator checking whether proofs reflect production reality.",
    what: "Verifies that the loop sees the same active fleet state as the dispatch surfaces.",
    needs: [
      "Shared source of truth between proof and operations",
      "No shadow inventory model",
    ],
    scenario:
      "Before trusting a green proof board, the operator wants to know the loop is reading live fleet state from the same database and not from mocked fixtures.",
    goal: "The proof subsystem can query the same live inventory dispatch relies on.",
    preconditions: [
      "Database is reachable",
      "Seatac site is seeded",
    ],
    successPath: [
      "Loop queries active Seatac vehicles",
      "At least one active vehicle is returned",
    ],
    failureModes: [
      "Proof system cannot see the live fleet",
      "Seed/inventory drift removes all active vehicles",
    ],
    canonicalSagaKey: "saga-seatac-ops-visibility",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-005",
  },
  {
    ucKey: "uc-seatac-booking-draft-created",
    title: "Executive assistant can create a valid draft booking on real inventory",
    summary:
      "A valid airport booking request should persist as a draft against a concrete unit, not just a vehicle type.",
    status: "active",
    personaKey: "executive-assistant",
    riskLevel: "critical",
    domains: ["booking", "payments", "seatac_co"],
    who: "Executive assistant placing a legitimate airport ride request.",
    what: "Creates a draft booking that reserves a real unit, not just a vehicle type label.",
    needs: [
      "Route resolution",
      "Concrete unit allocation",
      "Pending-payment draft state",
    ],
    scenario:
      "An assistant books a valid future airport transfer for a traveler. The system should persist a draft booking against a real vehicle unit so dispatch and checkout stay aligned.",
    goal: "A valid future request should create a booking draft tied to a concrete vehicle unit.",
    preconditions: [
      "Seatac inventory is seeded",
      "Guardrails and schedules allow the requested slot",
    ],
    successPath: [
      "Resolve a live Seatac route and vehicle",
      "Create a booking draft for a future slot",
      "Persist the booking with a vehicle unit and pending payment state",
    ],
    failureModes: [
      "Valid request does not create a booking draft",
      "Draft is created without an assigned unit",
    ],
    canonicalSagaKey: "saga-seatac-booking-draft-created",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-006",
  },
  {
    ucKey: "uc-seatac-overlap-rejected",
    title: "Dispatcher cannot overbook the last Seatac SUV slot",
    summary:
      "Once the shared SUV inventory is exhausted for a time window, the next overlapping booking must fail.",
    status: "active",
    personaKey: "dispatcher",
    riskLevel: "critical",
    domains: ["booking", "dispatch", "inventory", "seatac_co"],
    who: "Dispatcher protecting the last available SUV slot.",
    what: "Prevents the system from accepting one booking too many in an overlapping window.",
    needs: [
      "Shared inventory exhaustion checks",
      "Explainable rejection once supply is gone",
    ],
    scenario:
      "Two SUVs are already spoken for in the same airport-transfer window. A third overlapping request should be rejected instead of silently overcommitting the fleet.",
    goal: "If all units of a vehicle type are already claimed for a slot, the next booking must be rejected.",
    preconditions: [
      "Seatac inventory is seeded",
      "Proof cleanup can remove prior test bookings",
    ],
    successPath: [
      "Create enough overlapping bookings to exhaust all SUV units",
      "Attempt one more booking in the same window",
      "Receive an unavailability error instead of a new booking",
    ],
    failureModes: [
      "Inventory overallocation is possible",
      "Conflict is raised without a useful message",
    ],
    canonicalSagaKey: "saga-seatac-overlap-rejected",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-007",
  },
  {
    ucKey: "uc-seatac-payment-state-confirmed",
    title: "Revenue owner sees a paid draft become a confirmed booking",
    summary:
      "When payment is applied through the shared booking state path, the booking must become confirmed and paid.",
    status: "active",
    personaKey: "revenue-owner",
    riskLevel: "critical",
    domains: ["payments", "booking", "seatac_co"],
    who: "Revenue owner monitoring booking monetization.",
    what: "Needs a paid draft to move into the same confirmed state production bookings use.",
    needs: [
      "Unified payment-state transition",
      "No divergence between proof routes and production Stripe logic",
    ],
    scenario:
      "A draft booking receives a valid payment signal. The system should promote it into a confirmed, paid booking with the same state transition used in production.",
    goal: "A booking draft can be pushed into the paid state and end in confirmed status.",
    preconditions: [
      "Seatac inventory is seeded",
      "Protected proof routes are reachable",
    ],
    successPath: [
      "Create a valid booking draft",
      "Apply paid payment state through the shared Stripe update path",
      "Verify the booking is confirmed and paid",
    ],
    failureModes: [
      "Payment state update does not confirm the booking",
      "Payment proof diverges from the production Stripe sync path",
    ],
    canonicalSagaKey: "saga-seatac-payment-state-confirmed",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-008",
  },
  {
    ucKey: "uc-seatac-checkout-session-created",
    title: "Airport traveler is handed off to Stripe checkout for a valid ride",
    summary:
      "A valid Seatac booking should create a real checkout session and preserve the checkout reference on the booking.",
    status: "active",
    personaKey: "airport-traveler",
    riskLevel: "critical",
    domains: ["payments", "checkout", "booking", "seatac_co"],
    who: "Airport traveler ready to book a valid ride.",
    what: "Is handed off from the booking flow to a real Stripe checkout session.",
    needs: [
      "Checkout session creation",
      "Stable link between booking and checkout session",
    ],
    scenario:
      "After choosing a valid vehicle for a future transfer, the traveler submits the request and should be redirected into a live Stripe checkout session tied to that booking.",
    goal: "A valid Seatac booking request should create a Stripe checkout session and persist its session id on the booking.",
    preconditions: [
      "Stripe test mode is configured for the public app target",
      "Seatac inventory is seeded and schedulable",
    ],
    successPath: [
      "Create a valid future booking",
      "Create a checkout session through the same checkout path the public app uses",
      "Persist checkout session metadata on the booking row",
    ],
    failureModes: [
      "Checkout session creation fails for a valid booking",
      "Booking is created without an attached checkout session id",
    ],
    canonicalSagaKey: "saga-seatac-checkout-session-created",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-009",
  },
  {
    ucKey: "uc-seatac-reserve-success-aware",
    title: "Traveler sees reserve success stay pending until payment clears",
    summary:
      "The reserve success screen must not falsely imply success before payment actually settles.",
    status: "active",
    personaKey: "executive-assistant",
    riskLevel: "high",
    domains: ["payments", "checkout", "booking", "seatac_co"],
    who: "Traveler or assistant returning from Stripe before payment is settled.",
    what: "Views the reserve-success screen and needs honest payment state messaging.",
    needs: [
      "Session-aware reserve-success state",
      "No false confirmation before payment clears",
    ],
    scenario:
      "A user returns from checkout early or the payment has not yet settled. The reserve-success view must show a pending state instead of claiming the ride is confirmed.",
    goal: "The reserve success experience must not claim confirmation when the Stripe session is still unpaid.",
    preconditions: [
      "Stripe test mode is configured for the public app target",
      "A real checkout session can be created for a proof booking",
    ],
    successPath: [
      "Create a valid checkout session",
      "Resolve the reserve-success state for that session",
      "Return a pending state with the booking reference instead of a false confirmed state",
    ],
    failureModes: [
      "Reserve success reports confirmed while the session is still unpaid",
      "Reserve success cannot resolve the booking summary for a real session",
    ],
    canonicalSagaKey: "saga-seatac-reserve-success-aware",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-010",
  },
  {
    ucKey: "uc-seatac-reserve-browser-checkout-handoff",
    title: "Airport traveler can reach checkout from the public reserve UI",
    summary:
      "The real route page and reserve wizard should advance all the way to Stripe checkout in the browser.",
    status: "active",
    personaKey: "airport-traveler",
    riskLevel: "critical",
    domains: ["booking", "checkout", "browser", "seatac_co"],
    who: "Airport traveler using the public website.",
    what: "Moves through the real reserve wizard all the way to Stripe checkout.",
    needs: [
      "Working route page",
      "Working reserve wizard",
      "Live handoff into checkout",
    ],
    scenario:
      "A traveler lands on a route page, fills out the reserve steps, selects a vehicle, enters contact details, and should reach Stripe checkout without the flow breaking.",
    goal: "A customer can move through the public reserve UI and reach Stripe checkout from the actual route page.",
    preconditions: [
      "Stripe test mode is configured for the public app target",
      "The reserve route page renders with seeded Seatac inventory",
    ],
    successPath: [
      "Open a route-specific reserve page",
      "Advance through the real UI steps",
      "Submit contact details and hand off to Stripe checkout",
    ],
    failureModes: [
      "The reserve UI cannot advance through its steps",
      "The booking UI never reaches Stripe checkout for a valid trip",
    ],
    canonicalSagaKey: "saga-seatac-reserve-browser-checkout-handoff",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-011",
  },
  {
    ucKey: "uc-seatac-admin-proof-console-visible",
    title: "Dispatcher can reach the proof console after admin login",
    summary:
      "The operator must be able to sign in and reach the proof dashboard from the live admin interface.",
    status: "active",
    personaKey: "dispatcher",
    riskLevel: "high",
    domains: ["ops", "admin", "browser", "seatac_co"],
    who: "Dispatcher using the admin app.",
    what: "Signs in and opens the proof console to inspect loop health.",
    needs: [
      "Working admin auth",
      "Proof console route that renders real loop state",
    ],
    scenario:
      "A dispatcher logs into admin during operations and needs to reach the proof console to see current loop status, open failures, and remediation context.",
    goal: "The operator can sign in and reach the proof console from the real admin UI.",
    preconditions: [
      "The admin app target is reachable",
      "Seeded admin credentials are valid",
    ],
    successPath: [
      "Open admin login",
      "Authenticate with the seeded dispatch credentials",
      "Reach the proof dashboard and see grouped loop health",
    ],
    failureModes: [
      "Admin login breaks",
      "The proof dashboard route is inaccessible or fails to render its core summary",
    ],
    canonicalSagaKey: "saga-seatac-admin-proof-console-visible",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-012",
  },
  {
    ucKey: "uc-seatac-checkout-settlement-confirmed",
    title: "Revenue owner can settle a real checkout session into a paid booking",
    summary:
      "A real checkout session id should be able to flow through the payment settlement path and leave the booking confirmed.",
    status: "active",
    personaKey: "revenue-owner",
    riskLevel: "critical",
    domains: ["payments", "checkout", "booking", "seatac_co"],
    who: "Revenue owner validating the full paid-booking path.",
    what: "Takes a real checkout session through settlement and expects the booking to stay confirmed and paid.",
    needs: [
      "Checkout-session lookup",
      "Settlement through the shared payment-state path",
      "Persisted confirmed and paid timestamps",
    ],
    scenario:
      "A real checkout session exists for a booking. When the paid state is applied, the booking should remain linked, confirmed, and marked paid in the database.",
    goal: "A real checkout session id can be taken through the paid booking path and leave the booking confirmed and paid.",
    preconditions: [
      "Stripe test mode is configured for the public app target",
      "A real checkout session can be created for a proof booking",
    ],
    successPath: [
      "Create a real checkout session",
      "Settle that session through the proof settlement route",
      "Verify the booking stays confirmed and paid in the database",
    ],
    failureModes: [
      "Checkout settlement loses the booking link",
      "Paid settlement does not leave the booking confirmed",
    ],
    canonicalSagaKey: "saga-seatac-checkout-settlement-confirmed",
    sourceFilePath: PROOF_USE_CASES_FILE,
    sourceRef: "UC-013",
  },
];

export const proofSagas: ProofSagaSeed[] = [
  {
    sagaKey: "saga-seatac-future-availability",
    ucKey: "uc-seatac-future-availability",
    personaKey: "airport-traveler",
    title: "Future Seatac availability returns vehicles",
    description:
      "Proves a valid future Sea-Tac to Bellevue request exposes live inventory before checkout.",
    depth: "smoke",
    status: "active",
    tags: ["booking", "availability", "future"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Exercise the live availability endpoint for a healthy future airport transfer.",
      steps: [
        {
          key: "future-availability",
          kind: "http",
          title: "Request tomorrow afternoon Sea-Tac availability",
          method: "POST",
          path: "/api/vehicle-availability",
          body: {
            pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
            dropoffAddress: "Bellevue, WA",
            pickupAt: "{{next10am}}",
            returnAt: null,
            returnTrip: false,
            tripType: "flat",
            routeDurationMinutes: 32,
            hoursRequested: null,
          },
          expectStatus: 200,
          assertions: [
            { path: "body.availableVehicleIds.0", truthy: true },
            { path: "body.availableCounts", truthy: true },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-past-booking-rejected",
    ucKey: "uc-seatac-past-booking-rejected",
    personaKey: "airport-traveler",
    title: "Past-time booking requests are rejected",
    description:
      "Proves the public booking boundary rejects past pickup windows before pricing or checkout.",
    depth: "smoke",
    status: "active",
    tags: ["guardrails", "booking", "time"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Try the same airport request in the past and confirm the guardrail rejects it.",
      steps: [
        {
          key: "past-availability",
          kind: "http",
          title: "Request availability for a pickup in the past",
          method: "POST",
          path: "/api/vehicle-availability",
          body: {
            pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
            dropoffAddress: "Downtown Seattle, WA",
            pickupAt: "{{now-24h}}",
            returnAt: null,
            returnTrip: false,
            tripType: "flat",
            routeDurationMinutes: 27,
            hoursRequested: null,
          },
          expectStatus: 400,
          assertions: [{ path: "body.error", truthy: true }],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-outside-hours-blocked",
    ucKey: "uc-seatac-outside-hours-blocked",
    personaKey: "executive-assistant",
    title: "Outside-hours requests explain the operating window",
    description:
      "Proves an outside-hours booking attempt is blocked early with a usable scheduling explanation.",
    depth: "smoke",
    status: "active",
    tags: ["guardrails", "hours", "availability"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Confirm a 2 AM pickup is blocked before vehicle selection with an operating-hours message.",
      steps: [
        {
          key: "outside-hours",
          kind: "http",
          title: "Request a pickup outside the configured site hours",
          method: "POST",
          path: "/api/vehicle-availability",
          body: {
            pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
            dropoffAddress: "Bellevue, WA",
            pickupAt: "{{next2am}}",
            returnAt: null,
            returnTrip: false,
            tripType: "flat",
            routeDurationMinutes: 32,
            hoursRequested: null,
          },
          expectStatus: 400,
          assertions: [{ path: "body.error", includes: "4:00" }],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-stripe-webhook-guard",
    ucKey: "uc-seatac-stripe-webhook-guard",
    personaKey: "dispatcher",
    title: "Stripe webhook rejects missing signatures",
    description:
      "Proves the payment webhook refuses unsigned traffic and does not accept forged callbacks.",
    depth: "smoke",
    status: "active",
    tags: ["payments", "security", "webhook"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Hit the Stripe webhook without a signature and confirm it refuses the request.",
      steps: [
        {
          key: "unsigned-webhook",
          kind: "http",
          title: "Post to Stripe webhook without the required signature",
          method: "POST",
          path: "/api/stripe/webhook",
          body: {
            id: "evt_test_missing_signature",
            object: "event",
            type: "checkout.session.completed",
          },
          expectStatus: [400, 503],
          assertions: [{ path: "body.error", truthy: true }],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-ops-visibility",
    ucKey: "uc-seatac-ops-visibility",
    personaKey: "revenue-owner",
    title: "Proof loop can query live Seatac inventory",
    description:
      "Proves the loop reads the same active fleet state that dispatch relies on in production.",
    depth: "smoke",
    status: "active",
    tags: ["ops", "db", "inventory"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Query the live database for active Seatac vehicles to prove the loop sees real operational state.",
      steps: [
        {
          key: "active-vehicles",
          kind: "dbQuery",
          title: "Query active Seatac vehicles",
          sql: `
            select v.id as vehicle_id, v.name
            from vehicles v
            inner join sites s on s.id = v.site_id
            where s.slug = 'seatac_co' and v.active = true
            order by v.display_order asc, v.name asc
          `,
          assertions: [
            { path: "rowCount", gte: 1 },
            { path: "rows.0.vehicle_id", truthy: true },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-booking-draft-created",
    ucKey: "uc-seatac-booking-draft-created",
    personaKey: "executive-assistant",
    title: "Valid Seatac booking draft persists with a unit",
    description:
      "Proves a valid future request creates a persisted booking draft with an assigned concrete unit.",
    depth: "transaction",
    status: "active",
    tags: ["booking", "draft", "inventory"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Create a real booking draft against Seatac inventory and prove the draft persists with a concrete assigned unit.",
      steps: [
        {
          key: "cleanup-proof-draft-bookings",
          kind: "dbExec",
          title: "Delete prior proof bookings for the draft scenario",
          sql: `
            delete from bookings
            where customer_email = 'proof+draft@seatac.co'
          `,
          assertions: [{ path: "ok", equals: true }],
        },
        {
          key: "resolve-draft-targets",
          kind: "dbQuery",
          title: "Resolve the Seatac route and sedan vehicle",
          sql: `
            with route_target as (
              select r.id
              from routes r
              inner join sites s on s.id = r.site_id
              where s.slug = 'seatac_co' and r.slug = 'seatac-bellevue-core'
              limit 1
            ),
            vehicle_target as (
              select v.id
              from vehicles v
              inner join sites s on s.id = v.site_id
              where s.slug = 'seatac_co' and v.slug = 'airport-sedan'
              limit 1
            )
            select route_target.id as route_id, vehicle_target.id as vehicle_id
            from route_target
            cross join vehicle_target
          `,
          assertions: [
            { path: "rows.0.route_id", truthy: true },
            { path: "rows.0.vehicle_id", truthy: true },
          ],
          capture: [
            { as: "routeId", from: "rows.0.route_id" },
            { as: "vehicleId", from: "rows.0.vehicle_id" },
          ],
        },
        {
          key: "create-draft",
          kind: "http",
          title: "Create a future Seatac booking draft",
          method: "POST",
          path: "/api/proof/booking-draft",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.routeId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+72h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 2,
              bags: 2,
              hoursRequested: null,
              vehicleId: "{{capture.vehicleId}}",
              selectedExtras: [],
              customerName: "Proof Draft Rider",
              customerEmail: "proof+draft@seatac.co",
              customerPhone: "(206) 555-3001",
              customerSmsOptIn: false,
              specialInstructions: "Proof loop booking draft",
            },
          },
          expectStatus: 200,
          assertions: [
            { path: "body.booking.id", truthy: true },
            { path: "body.booking.vehicleUnitId", truthy: true },
            { path: "body.booking.paymentStatus", equals: "pending" },
          ],
          capture: [{ as: "bookingId", from: "body.booking.id" }],
        },
        {
          key: "verify-draft-row",
          kind: "dbQuery",
          title: "Verify the persisted booking draft row",
          sql: `
            select id, reference, vehicle_unit_id, payment_status
            from bookings
            where id = '{{capture.bookingId}}'
          `,
          assertions: [
            { path: "rowCount", equals: 1 },
            { path: "rows.0.vehicle_unit_id", truthy: true },
            { path: "rows.0.payment_status", equals: "pending" },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-overlap-rejected",
    ucKey: "uc-seatac-overlap-rejected",
    personaKey: "dispatcher",
    title: "Seatac SUV inventory rejects an overlapping overflow booking",
    description:
      "Proves shared SUV inventory exhaustion blocks the next overlapping booking instead of overcommitting units.",
    depth: "transaction",
    status: "active",
    tags: ["booking", "conflict", "inventory"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Exhaust the Airport SUV inventory for one future slot and confirm the next booking is rejected.",
      steps: [
        {
          key: "cleanup-proof-overlap-bookings",
          kind: "dbExec",
          title: "Delete prior proof overlap bookings",
          sql: `
            delete from bookings
            where customer_email like 'proof+overlap-%@seatac.co'
          `,
          assertions: [{ path: "ok", equals: true }],
        },
        {
          key: "resolve-overlap-targets",
          kind: "dbQuery",
          title: "Resolve the Seatac Bellevue route and SUV vehicle",
          sql: `
            with route_target as (
              select r.id
              from routes r
              inner join sites s on s.id = r.site_id
              where s.slug = 'seatac_co' and r.slug = 'seatac-bellevue-core'
              limit 1
            ),
            vehicle_target as (
              select v.id
              from vehicles v
              inner join sites s on s.id = v.site_id
              where s.slug = 'seatac_co' and v.slug = 'airport-suv'
              limit 1
            )
            select route_target.id as route_id, vehicle_target.id as vehicle_id
            from route_target
            cross join vehicle_target
          `,
          assertions: [
            { path: "rows.0.route_id", truthy: true },
            { path: "rows.0.vehicle_id", truthy: true },
          ],
          capture: [
            { as: "overlapRouteId", from: "rows.0.route_id" },
            { as: "overlapVehicleId", from: "rows.0.vehicle_id" },
          ],
        },
        {
          key: "create-overlap-booking-one",
          kind: "http",
          title: "Create the first overlapping SUV booking",
          method: "POST",
          path: "/api/proof/booking-draft",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.overlapRouteId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+96h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 4,
              bags: 4,
              hoursRequested: null,
              vehicleId: "{{capture.overlapVehicleId}}",
              selectedExtras: [],
              customerName: "Proof Overlap One",
              customerEmail: "proof+overlap-1@seatac.co",
              customerPhone: "(206) 555-3101",
              customerSmsOptIn: false,
              specialInstructions: "Proof overlap booking one",
            },
          },
          expectStatus: 200,
          assertions: [{ path: "body.booking.vehicleUnitId", truthy: true }],
        },
        {
          key: "create-overlap-booking-two",
          kind: "http",
          title: "Create the second overlapping SUV booking",
          method: "POST",
          path: "/api/proof/booking-draft",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.overlapRouteId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+96h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 4,
              bags: 4,
              hoursRequested: null,
              vehicleId: "{{capture.overlapVehicleId}}",
              selectedExtras: [],
              customerName: "Proof Overlap Two",
              customerEmail: "proof+overlap-2@seatac.co",
              customerPhone: "(206) 555-3102",
              customerSmsOptIn: false,
              specialInstructions: "Proof overlap booking two",
            },
          },
          expectStatus: 200,
          assertions: [{ path: "body.booking.vehicleUnitId", truthy: true }],
        },
        {
          key: "reject-overlap-booking-three",
          kind: "http",
          title: "Reject the third overlapping SUV booking",
          method: "POST",
          path: "/api/proof/booking-draft",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.overlapRouteId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+96h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 4,
              bags: 4,
              hoursRequested: null,
              vehicleId: "{{capture.overlapVehicleId}}",
              selectedExtras: [],
              customerName: "Proof Overlap Three",
              customerEmail: "proof+overlap-3@seatac.co",
              customerPhone: "(206) 555-3103",
              customerSmsOptIn: false,
              specialInstructions: "Proof overlap booking three",
            },
          },
          expectStatus: 409,
          assertions: [{ path: "body.error", includes: "unavailable" }],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-payment-state-confirmed",
    ucKey: "uc-seatac-payment-state-confirmed",
    personaKey: "revenue-owner",
    title: "Seatac paid booking becomes confirmed",
    description:
      "Proves the shared payment-state transition path leaves a valid draft confirmed and paid.",
    depth: "transaction",
    status: "active",
    tags: ["payments", "booking", "stripe"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Create a booking draft and then mark it paid through the protected proof payment route.",
      steps: [
        {
          key: "cleanup-proof-payment-bookings",
          kind: "dbExec",
          title: "Delete prior proof payment bookings",
          sql: `
            delete from bookings
            where customer_email = 'proof+payment@seatac.co'
          `,
          assertions: [{ path: "ok", equals: true }],
        },
        {
          key: "resolve-payment-targets",
          kind: "dbQuery",
          title: "Resolve the Seatac Bellevue route and sedan vehicle",
          sql: `
            with route_target as (
              select r.id
              from routes r
              inner join sites s on s.id = r.site_id
              where s.slug = 'seatac_co' and r.slug = 'seatac-bellevue-core'
              limit 1
            ),
            vehicle_target as (
              select v.id
              from vehicles v
              inner join sites s on s.id = v.site_id
              where s.slug = 'seatac_co' and v.slug = 'airport-sedan'
              limit 1
            )
            select route_target.id as route_id, vehicle_target.id as vehicle_id
            from route_target
            cross join vehicle_target
          `,
          assertions: [
            { path: "rows.0.route_id", truthy: true },
            { path: "rows.0.vehicle_id", truthy: true },
          ],
          capture: [
            { as: "paymentRouteId", from: "rows.0.route_id" },
            { as: "paymentVehicleId", from: "rows.0.vehicle_id" },
          ],
        },
        {
          key: "create-payment-draft",
          kind: "http",
          title: "Create a proof booking draft for payment sync",
          method: "POST",
          path: "/api/proof/booking-draft",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.paymentRouteId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+120h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 2,
              bags: 2,
              hoursRequested: null,
              vehicleId: "{{capture.paymentVehicleId}}",
              selectedExtras: [],
              customerName: "Proof Payment Rider",
              customerEmail: "proof+payment@seatac.co",
              customerPhone: "(206) 555-3201",
              customerSmsOptIn: false,
              specialInstructions: "Proof payment booking",
            },
          },
          expectStatus: 200,
          assertions: [{ path: "body.booking.id", truthy: true }],
          capture: [{ as: "paymentBookingId", from: "body.booking.id" }],
        },
        {
          key: "mark-booking-paid",
          kind: "http",
          title: "Apply a paid state through the proof payment sync route",
          method: "POST",
          path: "/api/proof/payment-sync",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            bookingId: "{{capture.paymentBookingId}}",
            paymentStatus: "paid",
            paymentIntentId: "pi_proof_paid",
            sessionId: "cs_proof_paid",
          },
          expectStatus: 200,
          assertions: [
            { path: "body.booking.status", equals: "confirmed" },
            { path: "body.booking.paymentStatus", equals: "paid" },
          ],
        },
        {
          key: "verify-paid-booking-row",
          kind: "dbQuery",
          title: "Verify the booking is persisted as confirmed and paid",
          sql: `
            select status, payment_status, payment_collected_at
            from bookings
            where id = '{{capture.paymentBookingId}}'
          `,
          assertions: [
            { path: "rowCount", equals: 1 },
            { path: "rows.0.status", equals: "confirmed" },
            { path: "rows.0.payment_status", equals: "paid" },
            { path: "rows.0.payment_collected_at", truthy: true },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-checkout-session-created",
    ucKey: "uc-seatac-checkout-session-created",
    personaKey: "airport-traveler",
    title: "Seatac checkout session is created for a valid booking",
    description:
      "Proves a valid Seatac ride request creates a real checkout session and links it to the booking.",
    depth: "transaction",
    status: "active",
    tags: ["payments", "checkout", "booking", "stripe"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Create a real Stripe checkout session for a valid Seatac booking and verify the booking row stores the session id.",
      requiresCapabilities: ["stripeCheckout"],
      steps: [
        {
          key: "cleanup-proof-checkout-bookings",
          kind: "dbExec",
          title: "Delete prior proof checkout bookings",
          sql: `
            delete from bookings
            where customer_email = 'proof+checkout@seatac.co'
          `,
          assertions: [{ path: "ok", equals: true }],
        },
        {
          key: "resolve-checkout-targets",
          kind: "dbQuery",
          title: "Resolve the Seatac Bellevue route and sedan vehicle",
          sql: `
            with route_target as (
              select r.id
              from routes r
              inner join sites s on s.id = r.site_id
              where s.slug = 'seatac_co' and r.slug = 'seatac-bellevue-core'
              limit 1
            ),
            vehicle_target as (
              select v.id
              from vehicles v
              inner join sites s on s.id = v.site_id
              where s.slug = 'seatac_co' and v.slug = 'airport-sedan'
              limit 1
            )
            select route_target.id as route_id, vehicle_target.id as vehicle_id
            from route_target
            cross join vehicle_target
          `,
          assertions: [
            { path: "rows.0.route_id", truthy: true },
            { path: "rows.0.vehicle_id", truthy: true },
          ],
          capture: [
            { as: "checkoutRouteId", from: "rows.0.route_id" },
            { as: "checkoutVehicleId", from: "rows.0.vehicle_id" },
          ],
        },
        {
          key: "create-checkout-session",
          kind: "http",
          title: "Create a proof checkout session through the shared checkout path",
          method: "POST",
          path: "/api/proof/checkout-session",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.checkoutRouteId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+144h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 2,
              bags: 2,
              hoursRequested: null,
              vehicleId: "{{capture.checkoutVehicleId}}",
              selectedExtras: [],
              customerName: "Proof Checkout Rider",
              customerEmail: "proof+checkout@seatac.co",
              customerPhone: "(206) 555-3301",
              customerSmsOptIn: false,
              specialInstructions: "Proof checkout booking",
            },
          },
          expectStatus: 200,
          assertions: [
            { path: "body.booking.id", truthy: true },
            { path: "body.checkoutSessionId", truthy: true },
            { path: "body.checkoutUrl", includes: "checkout.stripe.com" },
          ],
          capture: [
            { as: "checkoutBookingId", from: "body.booking.id" },
            { as: "checkoutSessionId", from: "body.checkoutSessionId" },
            { as: "checkoutReference", from: "body.booking.reference" },
          ],
        },
        {
          key: "verify-checkout-row",
          kind: "dbQuery",
          title: "Verify the checkout session is stored on the booking row",
          sql: `
            select id, payment_status, payment_checkout_session_id
            from bookings
            where id = '{{capture.checkoutBookingId}}'
          `,
          assertions: [
            { path: "rowCount", equals: 1 },
            { path: "rows.0.payment_status", equals: "pending" },
            { path: "rows.0.payment_checkout_session_id", truthy: true },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-reserve-success-aware",
    ucKey: "uc-seatac-reserve-success-aware",
    personaKey: "executive-assistant",
    title: "Seatac reserve success state stays payment-aware",
    description:
      "Proves the reserve-success view stays pending until the underlying checkout session is actually paid.",
    depth: "transaction",
    status: "active",
    tags: ["payments", "checkout", "success-page", "stripe"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Create a real checkout session and prove the reserve-success state reports pending until Stripe marks the session paid.",
      requiresCapabilities: ["stripeCheckout", "reserveSuccess"],
      steps: [
        {
          key: "cleanup-proof-success-bookings",
          kind: "dbExec",
          title: "Delete prior proof success bookings",
          sql: `
            delete from bookings
            where customer_email = 'proof+success@seatac.co'
          `,
          assertions: [{ path: "ok", equals: true }],
        },
        {
          key: "resolve-success-targets",
          kind: "dbQuery",
          title: "Resolve the Seatac Bellevue route and sedan vehicle",
          sql: `
            with route_target as (
              select r.id
              from routes r
              inner join sites s on s.id = r.site_id
              where s.slug = 'seatac_co' and r.slug = 'seatac-bellevue-core'
              limit 1
            ),
            vehicle_target as (
              select v.id
              from vehicles v
              inner join sites s on s.id = v.site_id
              where s.slug = 'seatac_co' and v.slug = 'airport-sedan'
              limit 1
            )
            select route_target.id as route_id, vehicle_target.id as vehicle_id
            from route_target
            cross join vehicle_target
          `,
          assertions: [
            { path: "rows.0.route_id", truthy: true },
            { path: "rows.0.vehicle_id", truthy: true },
          ],
          capture: [
            { as: "successRouteId", from: "rows.0.route_id" },
            { as: "successVehicleId", from: "rows.0.vehicle_id" },
          ],
        },
        {
          key: "create-success-checkout-session",
          kind: "http",
          title: "Create a proof checkout session for reserve-success verification",
          method: "POST",
          path: "/api/proof/checkout-session",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.successRouteId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+168h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 2,
              bags: 2,
              hoursRequested: null,
              vehicleId: "{{capture.successVehicleId}}",
              selectedExtras: [],
              customerName: "Proof Success Rider",
              customerEmail: "proof+success@seatac.co",
              customerPhone: "(206) 555-3401",
              customerSmsOptIn: false,
              specialInstructions: "Proof reserve success booking",
            },
          },
          expectStatus: 200,
          assertions: [
            { path: "body.checkoutSessionId", truthy: true },
            { path: "body.booking.reference", truthy: true },
          ],
          capture: [
            { as: "successCheckoutSessionId", from: "body.checkoutSessionId" },
            { as: "successBookingReference", from: "body.booking.reference" },
          ],
        },
        {
          key: "resolve-success-state",
          kind: "http",
          title: "Resolve the reserve-success state for the unpaid checkout session",
          method: "POST",
          path: "/api/proof/reserve-success",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            sessionId: "{{capture.successCheckoutSessionId}}",
          },
          expectStatus: 200,
          assertions: [
            { path: "body.viewState", equals: "pending" },
            { path: "body.booking.reference", equals: "{{capture.successBookingReference}}" },
            { path: "body.session.paymentStatus", equals: "unpaid" },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-reserve-browser-checkout-handoff",
    ucKey: "uc-seatac-reserve-browser-checkout-handoff",
    personaKey: "airport-traveler",
    title: "Seatac reserve browser flow reaches Stripe checkout",
    description:
      "Proves the real route page and reserve wizard can hand a valid customer flow off to Stripe checkout.",
    depth: "transaction",
    status: "active",
    tags: ["browser", "booking", "checkout", "customer-journey"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Drive the public route-specific reserve UI and verify it hands off to a real Stripe checkout session.",
      targetType: "public",
      requiresCapabilities: ["stripeCheckout", "browserPublic"],
      steps: [
        {
          key: "cleanup-proof-browser-bookings",
          kind: "dbExec",
          title: "Delete prior proof bookings before the browser reserve flow",
          sql: `
            delete from bookings
            where customer_email like 'proof+%@seatac.co'
          `,
          assertions: [{ path: "ok", equals: true }],
        },
        {
          key: "browser-reserve-to-checkout",
          kind: "browser",
          title: "Move through the reserve UI to Stripe checkout",
          scenario: "seatacReserveToCheckout",
          assertions: [
            { path: "finalUrl", includes: "checkout.stripe.com" },
            { path: "checkoutVisible", equals: true },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-admin-proof-console-visible",
    ucKey: "uc-seatac-admin-proof-console-visible",
    personaKey: "dispatcher",
    title: "Admin browser flow reaches the proof console",
    description:
      "Proves the real admin login flow lands an operator on the proof console successfully.",
    depth: "smoke",
    status: "active",
    tags: ["browser", "admin", "ops", "proof-console"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Sign in through the real admin UI and verify the proof console renders its grouped loop health.",
      targetType: "admin",
      requiresCapabilities: ["browserAdmin", "proofDashboard"],
      steps: [
        {
          key: "browser-admin-proof-console",
          kind: "browser",
          title: "Log in and load the proof console",
          scenario: "adminProofConsole",
          assertions: [
            { path: "proofHeading", includes: "Live proof and OODA console" },
            { path: "summaryVisible", equals: true },
          ],
        },
      ],
    },
  },
  {
    sagaKey: "saga-seatac-checkout-settlement-confirmed",
    ucKey: "uc-seatac-checkout-settlement-confirmed",
    personaKey: "revenue-owner",
    title: "Seatac checkout settlement leaves booking confirmed",
    description:
      "Proves a real checkout session can be settled through the booking payment path without losing booking state.",
    depth: "transaction",
    status: "active",
    tags: ["payments", "checkout", "settlement", "release-gate"],
    spec: {
      siteSlug: "seatac_co",
      summary:
        "Create a real checkout session, settle it through the proof path, and verify the booking remains confirmed and paid.",
      targetType: "public",
      requiresCapabilities: ["stripeCheckout"],
      steps: [
        {
          key: "cleanup-proof-settlement-bookings",
          kind: "dbExec",
          title: "Delete prior proof settlement bookings",
          sql: `
            delete from bookings
            where customer_email = 'proof+settlement@seatac.co'
          `,
          assertions: [{ path: "ok", equals: true }],
        },
        {
          key: "resolve-settlement-targets",
          kind: "dbQuery",
          title: "Resolve the Seatac Bellevue route and sedan vehicle",
          sql: `
            with route_target as (
              select r.id
              from routes r
              inner join sites s on s.id = r.site_id
              where s.slug = 'seatac_co' and r.slug = 'seatac-bellevue-core'
              limit 1
            ),
            vehicle_target as (
              select v.id
              from vehicles v
              inner join sites s on s.id = v.site_id
              where s.slug = 'seatac_co' and v.slug = 'airport-sedan'
              limit 1
            )
            select route_target.id as route_id, vehicle_target.id as vehicle_id
            from route_target
            cross join vehicle_target
          `,
          assertions: [
            { path: "rows.0.route_id", truthy: true },
            { path: "rows.0.vehicle_id", truthy: true },
          ],
          capture: [
            { as: "settlementRouteId", from: "rows.0.route_id" },
            { as: "settlementVehicleId", from: "rows.0.vehicle_id" },
          ],
        },
        {
          key: "create-settlement-checkout-session",
          kind: "http",
          title: "Create a real checkout session for settlement proofing",
          method: "POST",
          path: "/api/proof/checkout-session",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            siteSlug: "seatac_co",
            booking: {
              serviceMode: "airport",
              tripType: "flat",
              routeId: "{{capture.settlementRouteId}}",
              pickupLabel: "Sea-Tac Airport",
              pickupAddress: "Seattle-Tacoma International Airport, 17801 International Blvd, SeaTac, WA 98158",
              dropoffLabel: "Bellevue",
              dropoffAddress: "Bellevue, WA",
              routeName: "Sea-Tac to Bellevue",
              routeDistanceMiles: 18,
              routeDurationMinutes: 32,
              pickupAt: "{{now+192h}}",
              returnAt: null,
              returnTrip: false,
              passengers: 2,
              bags: 2,
              hoursRequested: null,
              vehicleId: "{{capture.settlementVehicleId}}",
              selectedExtras: [],
              customerName: "Proof Settlement Rider",
              customerEmail: "proof+settlement@seatac.co",
              customerPhone: "(206) 555-3701",
              customerSmsOptIn: false,
              specialInstructions: "Proof checkout settlement booking",
            },
          },
          expectStatus: 200,
          assertions: [
            { path: "body.booking.id", truthy: true },
            { path: "body.checkoutSessionId", truthy: true },
          ],
          capture: [
            { as: "settlementBookingId", from: "body.booking.id" },
            { as: "settlementSessionId", from: "body.checkoutSessionId" },
          ],
        },
        {
          key: "settle-checkout-session",
          kind: "http",
          title: "Settle the real checkout session through the proof route",
          method: "POST",
          path: "/api/proof/checkout-settle",
          headers: {
            "x-proof-secret": "{{proofSecret}}",
          },
          body: {
            sessionId: "{{capture.settlementSessionId}}",
            paymentStatus: "paid",
          },
          expectStatus: 200,
          assertions: [
            { path: "body.booking.status", equals: "confirmed" },
            { path: "body.booking.paymentStatus", equals: "paid" },
          ],
        },
        {
          key: "verify-settlement-row",
          kind: "dbQuery",
          title: "Verify the settled booking remains confirmed and paid",
          sql: `
            select status, payment_status, payment_checkout_session_id, payment_collected_at
            from bookings
            where id = '{{capture.settlementBookingId}}'
          `,
          assertions: [
            { path: "rowCount", equals: 1 },
            { path: "rows.0.status", equals: "confirmed" },
            { path: "rows.0.payment_status", equals: "paid" },
            { path: "rows.0.payment_checkout_session_id", equals: "{{capture.settlementSessionId}}" },
            { path: "rows.0.payment_collected_at", truthy: true },
          ],
        },
      ],
    },
  },
];

export const proofLoops: ProofLoopSeed[] = [
  {
    loopKey: "loop-seatac-booking-funnel",
    title: "Seatac booking funnel hardening",
    objective:
      "Continuously prove that the public Seatac booking flow only accepts valid service windows and surfaces real availability.",
    status: "active",
    currentPhase: "observe",
    priority: 1,
    domains: ["booking", "availability", "seatac_co"],
    focus: {
      sagaKeys: [
        "saga-seatac-future-availability",
        "saga-seatac-past-booking-rejected",
        "saga-seatac-outside-hours-blocked",
        "saga-seatac-booking-draft-created",
        "saga-seatac-overlap-rejected",
        "saga-seatac-payment-state-confirmed",
        "saga-seatac-checkout-session-created",
        "saga-seatac-reserve-success-aware",
        "saga-seatac-reserve-browser-checkout-handoff",
        "saga-seatac-checkout-settlement-confirmed",
      ],
      ucKeys: [
        "uc-seatac-future-availability",
        "uc-seatac-past-booking-rejected",
        "uc-seatac-outside-hours-blocked",
        "uc-seatac-booking-draft-created",
        "uc-seatac-overlap-rejected",
        "uc-seatac-payment-state-confirmed",
        "uc-seatac-checkout-session-created",
        "uc-seatac-reserve-success-aware",
        "uc-seatac-reserve-browser-checkout-handoff",
        "uc-seatac-checkout-settlement-confirmed",
      ],
    },
    currentBlockers: [
      "Loop depends on seeded inventory plus a reachable public app instance.",
      "Checkout-session proofs require Stripe test mode to be configured on the active target.",
    ],
    hypotheses: [
      "Most customer-facing regressions will show up first in booking-window and availability proofs.",
    ],
    decisions: [
      "Start with smoke sagas that prove core truths instead of a huge generalized testing DSL.",
    ],
    nextActions: [
      "Promote a paid reserve-success confirmation proof once automated Stripe payment completion is part of the loop.",
    ],
  },
  {
    loopKey: "loop-seatac-trust-boundary",
    title: "Seatac trust and payments boundary",
    objective:
      "Track whether webhook and payment boundary protections are still intact before traffic or partner integrations scale up.",
    status: "active",
    currentPhase: "observe",
    priority: 2,
    domains: ["payments", "security", "seatac_co"],
    focus: {
      sagaKeys: [
        "saga-seatac-stripe-webhook-guard",
        "saga-seatac-payment-state-confirmed",
        "saga-seatac-checkout-session-created",
        "saga-seatac-reserve-success-aware",
        "saga-seatac-reserve-browser-checkout-handoff",
        "saga-seatac-checkout-settlement-confirmed",
      ],
      ucKeys: [
        "uc-seatac-stripe-webhook-guard",
        "uc-seatac-payment-state-confirmed",
        "uc-seatac-checkout-session-created",
        "uc-seatac-reserve-success-aware",
        "uc-seatac-reserve-browser-checkout-handoff",
        "uc-seatac-checkout-settlement-confirmed",
      ],
    },
    currentBlockers: [
      "Paid-session confirmation still depends on manual or browser-driven Stripe test payment completion.",
    ],
    hypotheses: [
      "Security regressions at the webhook boundary are cheaper to catch here than in customer support.",
    ],
    decisions: [
      "Run signature-guard, checkout-session, and paid-state proofs on every loop before scaling traffic.",
      "Use checkout settlement as the release-grade proof for paid booking state until deeper Stripe-hosted automation is worth the cost.",
    ],
    nextActions: [
      "Promote a real Stripe-hosted card-entry payment proof only if the hosted Checkout UI becomes stable enough for repeat automation.",
    ],
  },
  {
    loopKey: "loop-seatac-proof-console",
    title: "Seatac proof console reachability",
    objective:
      "Continuously prove that operators can still sign in and read the DB-native proof console when customer-facing proofs need intervention.",
    status: "active",
    currentPhase: "observe",
    priority: 3,
    domains: ["ops", "admin", "browser", "seatac_co"],
    focus: {
      sagaKeys: ["saga-seatac-admin-proof-console-visible"],
      ucKeys: ["uc-seatac-admin-proof-console-visible"],
    },
    currentBlockers: [
      "Browser login proof depends on the seeded admin credentials remaining aligned with the admin app.",
    ],
    hypotheses: [
      "If the proof console cannot be reached after login, operators will learn about failing customer proofs too late.",
    ],
    decisions: [
      "Keep browser coverage narrow and focused on the operator entry path instead of building a broad admin UI suite.",
    ],
    nextActions: [
      "Add a browser proof for linked-fix editing only after the proof console shell stays stable for multiple runs.",
    ],
  },
];
