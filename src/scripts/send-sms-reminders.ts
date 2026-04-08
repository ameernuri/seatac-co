import { sendDueCustomerSmsReminders } from "@/lib/reminders";

async function main() {
  const result = await sendDueCustomerSmsReminders();

  if (result.dryReason) {
    console.log(result.dryReason);
    return;
  }

  if (result.scanned === 0) {
    console.log("No booking reminders due.");
    return;
  }

  console.log(
    `Reminder run complete. scanned=${result.scanned} sent=${result.sent} failed=${result.failed} skipped=${result.skipped}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
