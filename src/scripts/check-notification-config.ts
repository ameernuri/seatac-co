import { env } from "@/env";
import {
  getDispatchEmailRecipients,
  isEmailConfigured,
} from "@/lib/email";
import {
  getDispatchSmsRecipients,
  getSmsSenderConfig,
  isSmsConfigured,
} from "@/lib/sms";

function printLine(label: string, value: string) {
  console.log(`${label.padEnd(28)} ${value}`);
}

function main() {
  const sender = getSmsSenderConfig();

  console.log("seatac.co notification configuration");
  console.log("------------------------------------");
  printLine("Site slug", env.siteSlug);
  printLine("App URL", env.appUrl);
  printLine("Email configured", isEmailConfigured() ? "yes" : "no");
  printLine("Email from", env.resendFromEmail || "(missing)");
  printLine("Email reply-to", env.resendReplyToEmail || "(missing)");
  printLine(
    "Dispatch email recipients",
    getDispatchEmailRecipients().join(", ") || "(missing)",
  );
  printLine("SMS configured", isSmsConfigured() ? "yes" : "no");
  printLine(
    "SMS sender mode",
    sender.mode === "messaging-service"
      ? "Messaging Service"
      : sender.mode === "from-number"
        ? "From Number"
        : "Unconfigured",
  );
  printLine("SMS sender value", sender.value || "(missing)");
  printLine(
    "Dispatch SMS recipients",
    getDispatchSmsRecipients().join(", ") || "(missing)",
  );

  if (sender.mode !== "messaging-service") {
    console.warn("");
    console.warn(
      "Warning: production should prefer TWILIO_MESSAGING_SERVICE_SID so sender routing can move between toll-free and 10DLC without code changes.",
    );
  }
}

main();
