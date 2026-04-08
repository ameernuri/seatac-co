# Reminder System Plan

## Goal

Set up reliable booking reminders for `seatac.co` using the existing Vercel deployment first, with room to grow later.

The first version should:
- send customer SMS reminders for eligible bookings
- support booking links in reminder messages
- be safe to run repeatedly
- keep state in the database
- work through a Vercel cron-triggered route instead of an always-on server

## Current State

Already present:
- booking-level SMS reminder script:
  - `src/scripts/send-sms-reminders.ts`
- one reminder timestamp on bookings:
  - `customerSmsReminderSentAt`
- customer SMS templates:
  - `src/lib/sms-templates.ts`
- manage-booking URL helper:
  - `src/lib/account-bookings.ts`
- Twilio SMS sending infrastructure already in place

Current gaps:
- no scheduled trigger in `vercel.json`
- no internal cron API route
- only one generic reminder timestamp
- no email reminder system
- no idempotent multi-stage reminder model
- no admin/debug visibility for reminder execution

## Product Scope

### Phase 1

Implement:
- one scheduled customer SMS reminder flow
- Vercel Cron every 5 minutes
- one internal reminder job route
- one reminder window:
  - default lead time from env
- idempotent booking updates

Use cases:
- paid/confirmed upcoming bookings
- opted-in customers only
- include booking manage link

### Phase 2

Add:
- customer email reminders
- separate reminder timestamps by channel and stage
- return-trip reminders
- dispatch-side reminders if needed

### Phase 3

Add:
- admin visibility
- manual resend
- reminder audit log
- more robust scheduling if Vercel cron becomes limiting

## Architecture

### Scheduler

Use:
- Vercel Cron

Pattern:
- cron hits a protected route like:
  - `/api/jobs/send-reminders`
- route validates secret header
- route runs reminder selection/sending logic
- route updates sent timestamps

Why:
- already on Vercel
- reminder polling is short-lived
- avoids adding AWS/Lambda/EventBridge complexity too early

## Data Model Changes

### Existing

`bookings.customerSmsReminderSentAt`

### Needed Next

Replace the single reminder field with explicit fields:

- `customerSmsReminderLeadSentAt`
- `customerEmailReminderLeadSentAt`

Optional future additions:
- `customerSmsDayBeforeSentAt`
- `customerSmsTwoHourSentAt`
- `customerEmailDayBeforeSentAt`
- `customerEmailTwoHourSentAt`
- `returnCustomerSmsReminderLeadSentAt`
- `returnCustomerEmailReminderLeadSentAt`

If we want to move incrementally, Phase 1 can keep:
- `customerSmsReminderSentAt`

Then migrate later once we add more reminder types.

## Job Rules

For Phase 1, a booking is reminder-eligible when:
- `customerSmsOptIn = true`
- `customerSmsReminderSentAt is null`
- `status in ("confirmed", "paid")`
- `paymentStatus in ("paid")`
- `pickupAt >= now`
- `pickupAt <= now + reminderLeadHours`

Future rules:
- skip canceled bookings
- skip already-started bookings
- support return trip reminder windows
- support email even without SMS opt-in if email reminders become a product requirement

## Delivery Rules

### SMS

Use existing:
- `buildCustomerReminderSms`
- `sendTextMessage`

Message should include:
- route or booking reference
- pickup time
- booking manage link

### Email

Not in Phase 1 unless we choose to add it immediately.

## Security

Cron route must require:
- a shared secret header, for example:
  - `Authorization: Bearer <CRON_SECRET>`

Never expose the job route publicly without auth.

## Files To Add / Update

### Phase 1 core

Add:
- `src/app/api/jobs/send-reminders/route.ts`

Update:
- `vercel.json`
- `src/scripts/send-sms-reminders.ts` or extract shared logic into:
  - `src/lib/reminders.ts`
- `src/db/schema.ts` if we add new reminder timestamps now
- `src/env.ts` if we add cron secret / reminder config

### Likely refactor

Create:
- `src/lib/reminders.ts`

Responsibilities:
- select eligible bookings
- send reminders
- mark bookings as reminded
- expose one function reusable by:
  - cron API route
  - local script

## Recommended Implementation Order

Done:
- [x] Extract reminder logic from `src/scripts/send-sms-reminders.ts` into `src/lib/reminders.ts`
- [x] Keep the script as a thin runner around the shared logic
- [x] Add protected route:
  - `src/app/api/jobs/send-reminders/route.ts`
- [x] Add cron config to `vercel.json`
- [x] Keep current single reminder timestamp for Phase 1

Next:
- [x] Add structured logging / clearer run output
- [x] Add dry-run route support for safe local validation
- [x] Test locally by hitting the route directly
- [x] Add email reminders if still desired after SMS is stable

## Testing Checklist

### Local

- booking with SMS opt-in inside reminder window gets one reminder
- same booking does not get a second reminder on repeat run
- booking outside window does not send
- unpaid booking does not send
- canceled booking does not send
- booking SMS contains manage link

Verified locally:
- `GET /api/jobs/send-reminders?dryRun=1` returns `200 OK`
- current dry run result:
  - `scanned: 3`
  - `failed: 0`
  - `skipped: 3`
- current local DB is missing `bookings.customer_email_reminder_sent_at`, so the job now falls back to SMS-only mode instead of crashing

### Production sanity

- cron route rejects missing/invalid auth
- cron route returns counts:
  - scanned
  - sent
  - skipped
  - failed
- logs show Twilio failures clearly

## Open Decisions

1. Do we keep Phase 1 as SMS-only, or add email reminders immediately?
2. Do we keep the existing single reminder timestamp for now, or add stage-specific fields before shipping?
3. Should reminder lead time remain global via env, or move into site settings/admin later?

## Decision For Now

Recommended:
- Phase 1 = SMS-only
- keep the current single reminder timestamp
- use env-configured lead time
- ship on Vercel cron

That gives the fastest reliable version without overbuilding.

## Definition Of Done

Phase 1 is done when:
- a protected Vercel cron route exists
- reminder logic is shared in `src/lib/reminders.ts`
- customer SMS reminders send once per eligible booking
- reminder messages include booking links
- booking rows are marked as reminded
- route is testable locally
- logs are readable enough to debug failures
