import { NextResponse } from "next/server";

function getString(
  formData: FormData,
  key: string,
) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const formData = await request.formData();

  console.info("Twilio SMS status callback", {
    accountSid: getString(formData, "AccountSid"),
    errorCode: getString(formData, "ErrorCode"),
    errorMessage: getString(formData, "ErrorMessage"),
    from: getString(formData, "From"),
    messageSid: getString(formData, "MessageSid"),
    messageStatus: getString(formData, "MessageStatus"),
    messagingServiceSid: getString(formData, "MessagingServiceSid"),
    to: getString(formData, "To"),
  });

  return NextResponse.json({ ok: true });
}
