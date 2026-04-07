"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { normalizeClientPhone } from "@/lib/client-phone";

type Props = {
  initialEmail: string;
  initialEmailVerified: boolean;
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
  initialPhoneVerified: boolean;
  initialSmsOptIn: boolean;
};

function InlineVerifiedBadge({ label }: { label: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex size-5 items-center justify-center rounded-full border border-[#2d6a4f]/18 bg-[#2d6a4f]/6 text-[#2d6a4f]">
          <span>
            <Check className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  return /\S+@\S+\.\S+/.test(email) ? email : "";
}

export function AccountProfileForm({
  initialEmail,
  initialEmailVerified,
  initialFirstName,
  initialLastName,
  initialPhone,
  initialPhoneVerified,
  initialSmsOptIn,
}: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [smsOptIn, setSmsOptIn] = useState(initialSmsOptIn);

  const [emailChallengeId, setEmailChallengeId] = useState<string | null>(null);
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailSendLoading, setEmailSendLoading] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);
  const [knownVerifiedEmail, setKnownVerifiedEmail] = useState(
    initialEmailVerified ? normalizeEmail(initialEmail) : null,
  );

  const [phoneChallengeId, setPhoneChallengeId] = useState<string | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneSendLoading, setPhoneSendLoading] = useState(false);
  const [phoneVerifyLoading, setPhoneVerifyLoading] = useState(false);
  const [phoneResendCooldown, setPhoneResendCooldown] = useState(0);
  const [knownVerifiedPhone, setKnownVerifiedPhone] = useState(
    initialPhoneVerified ? normalizeClientPhone(initialPhone) : null,
  );

  const [saveLoading, setSaveLoading] = useState(false);

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const normalizedPhone = useMemo(() => normalizeClientPhone(phone) || null, [phone]);
  const alreadyVerifiedEmail = Boolean(normalizedEmail && knownVerifiedEmail === normalizedEmail);
  const alreadyVerifiedPhone = Boolean(normalizedPhone && knownVerifiedPhone === normalizedPhone);
  const canSendEmailCode = Boolean(normalizedEmail);
  const canSendPhoneCode = Boolean(normalizedPhone);
  const canSave =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    Boolean(normalizedEmail) &&
    Boolean(normalizedPhone);

  useEffect(() => {
    if (emailResendCooldown <= 0) return;
    const timer = window.setTimeout(() => setEmailResendCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [emailResendCooldown]);

  useEffect(() => {
    if (phoneResendCooldown <= 0) return;
    const timer = window.setTimeout(() => setPhoneResendCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phoneResendCooldown]);

  useEffect(() => {
    if (knownVerifiedEmail && knownVerifiedEmail !== normalizedEmail) {
      setEmailCodeSent(false);
      setEmailCode("");
      setEmailChallengeId(null);
      setEmailResendCooldown(0);
    }
  }, [knownVerifiedEmail, normalizedEmail]);

  useEffect(() => {
    if (knownVerifiedPhone && knownVerifiedPhone !== normalizedPhone) {
      setPhoneCodeSent(false);
      setPhoneCode("");
      setPhoneChallengeId(null);
      setPhoneResendCooldown(0);
      setSmsOptIn(false);
    }
  }, [knownVerifiedPhone, normalizedPhone]);

  async function sendEmailCode() {
    if (!canSendEmailCode || (emailCodeSent && emailResendCooldown > 0)) return;

    setEmailSendLoading(true);
    const response = await fetch("/api/client-auth/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: normalizedEmail,
        purpose: "profile-update",
      }),
    });
    const data = await response.json().catch(() => ({}));
    setEmailSendLoading(false);

    if (!response.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Verification code could not be sent.");
      return;
    }

    setEmailChallengeId(data.challengeId ?? null);
    setEmailCode("");
    setEmailCodeSent(true);
    setEmailResendCooldown(30);
    toast.success("Verification code sent.");
  }

  async function verifyEmailCode() {
    if (!emailChallengeId || emailCode.trim().length !== 6 || !normalizedEmail) return;

    setEmailVerifyLoading(true);
    const response = await fetch("/api/client-auth/email/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        challengeId: emailChallengeId,
        code: emailCode,
        email: normalizedEmail,
        purpose: "profile-update",
      }),
    });
    const data = await response.json().catch(() => ({}));
    setEmailVerifyLoading(false);

    if (!response.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Email verification failed.");
      return;
    }

    setEmailChallengeId(typeof data.challengeId === "string" ? data.challengeId : emailChallengeId);
    setKnownVerifiedEmail(normalizedEmail);
    setEmailCodeSent(false);
    setEmailCode("");
    setEmailResendCooldown(0);
    toast.success("Email verified.");
  }

  async function sendPhoneCode() {
    if (!canSendPhoneCode || (phoneCodeSent && phoneResendCooldown > 0)) return;

    setPhoneSendLoading(true);
    const response = await fetch("/api/client-auth/phone/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        phone: normalizedPhone ?? phone,
        purpose: "profile-update",
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPhoneSendLoading(false);

    if (!response.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Verification code could not be sent.");
      return;
    }

    setPhoneChallengeId(data.challengeId ?? null);
    setPhoneCode("");
    setPhoneCodeSent(true);
    setPhoneResendCooldown(30);
    toast.success("Verification code sent.");
  }

  async function verifyPhoneCode() {
    if (!phoneChallengeId || phoneCode.trim().length !== 6 || !normalizedPhone) return;

    setPhoneVerifyLoading(true);
    const response = await fetch("/api/client-auth/phone/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        challengeId: phoneChallengeId,
        code: phoneCode,
        phone: normalizedPhone,
        purpose: "profile-update",
      }),
    });
    const data = await response.json().catch(() => ({}));
    setPhoneVerifyLoading(false);

    if (!response.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Phone verification failed.");
      return;
    }

    setPhoneChallengeId(typeof data.challengeId === "string" ? data.challengeId : phoneChallengeId);
    setKnownVerifiedPhone(normalizedPhone);
    setPhoneCodeSent(false);
    setPhoneCode("");
    setPhoneResendCooldown(0);
    toast.success("Mobile number verified.");
  }

  async function handleSave() {
    if (!canSave) {
      toast.error("Complete your profile details first.");
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    if (!alreadyVerifiedEmail) {
      toast.error("Verify your email before saving changes.");
      return;
    }

    if (!alreadyVerifiedPhone) {
      toast.error("Verify your mobile number before saving changes.");
      return;
    }

    setSaveLoading(true);
    const response = await fetch("/api/client-auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email: normalizedEmail,
        emailChallengeId,
        emailVerified: alreadyVerifiedEmail,
        name: fullName,
        phone,
        phoneChallengeId,
        phoneVerified: alreadyVerifiedPhone,
        policyAgreed: false,
        purpose: "profile-update",
        smsOptIn,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaveLoading(false);

    if (!response.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Profile could not be updated.");
      return;
    }

    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">
          First name
        </Label>
        <Input
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          autoComplete="given-name"
          className="h-14 rounded-[1.7rem] border-[#d7e6de] bg-white px-5 text-[#1a3d34]"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">
          Last name
        </Label>
        <Input
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          autoComplete="family-name"
          className="h-14 rounded-[1.7rem] border-[#d7e6de] bg-white px-5 text-[#1a3d34]"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">
            Email
          </Label>
          <div className="flex items-center gap-3">
            {alreadyVerifiedEmail ? <InlineVerifiedBadge label="Verified email address" /> : null}
            {emailCodeSent && !alreadyVerifiedEmail ? (
              <button
                type="button"
                onClick={sendEmailCode}
                disabled={emailSendLoading || emailResendCooldown > 0}
                className="text-xs font-medium text-[#2d6a4f] underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              >
                {emailResendCooldown > 0 ? `Resend in ${emailResendCooldown}s` : "Resend"}
              </button>
            ) : null}
          </div>
        </div>
        <ButtonGroup className="w-full rounded-[1.7rem]">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={emailCodeSent ? "h-14 min-w-0 flex-[1.15] border-[#d7e6de] bg-white px-5 text-[#1a3d34] shadow-none focus-visible:z-10" : "h-14 min-w-0 flex-1 border-[#d7e6de] bg-white px-5 text-[#1a3d34] shadow-none focus-visible:z-10"}
          />
          {emailCodeSent ? (
            <>
              <Input
                value={emailCode}
                onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && emailCode.trim().length === 6 && !emailVerifyLoading) {
                    event.preventDefault();
                    void verifyEmailCode();
                  }
                }}
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                className="h-14 min-w-0 flex-1 border-[#d7e6de] bg-white px-5 text-base font-medium tracking-[0.2em] text-[#1a3d34] placeholder:tracking-normal focus-visible:z-10"
              />
              <Button
                type="button"
                onClick={verifyEmailCode}
                disabled={emailVerifyLoading || emailCode.trim().length !== 6}
                className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
              >
                {emailVerifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Verify
              </Button>
            </>
          ) : alreadyVerifiedEmail ? null : normalizedEmail ? (
            <Button
              type="button"
              onClick={sendEmailCode}
              disabled={emailSendLoading}
              className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
            >
              {emailSendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Send code
            </Button>
          ) : null}
        </ButtonGroup>
      </div>

      <div className="space-y-2 md:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7a6e]">
            Mobile number
          </Label>
          <div className="flex items-center gap-3">
            {alreadyVerifiedPhone ? <InlineVerifiedBadge label="Verified mobile number" /> : null}
            {phoneCodeSent && !alreadyVerifiedPhone ? (
              <button
                type="button"
                onClick={sendPhoneCode}
                disabled={phoneSendLoading || phoneResendCooldown > 0}
                className="text-xs font-medium text-[#2d6a4f] underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              >
                {phoneResendCooldown > 0 ? `Resend in ${phoneResendCooldown}s` : "Resend"}
              </button>
            ) : null}
          </div>
        </div>
        <ButtonGroup className="w-full rounded-[1.7rem]">
          <Input
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={phoneCodeSent ? "h-14 min-w-0 flex-[1.15] border-[#d7e6de] bg-white px-5 text-[#1a3d34] shadow-none focus-visible:z-10" : "h-14 min-w-0 flex-1 border-[#d7e6de] bg-white px-5 text-[#1a3d34] shadow-none focus-visible:z-10"}
          />
          {phoneCodeSent ? (
            <>
              <Input
                value={phoneCode}
                onChange={(event) => setPhoneCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && phoneCode.trim().length === 6 && !phoneVerifyLoading) {
                    event.preventDefault();
                    void verifyPhoneCode();
                  }
                }}
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                className="h-14 min-w-0 flex-1 border-[#d7e6de] bg-white px-5 text-base font-medium tracking-[0.2em] text-[#1a3d34] placeholder:tracking-normal focus-visible:z-10"
              />
              <Button
                type="button"
                onClick={verifyPhoneCode}
                disabled={phoneVerifyLoading || phoneCode.trim().length !== 6}
                className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
              >
                {phoneVerifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Verify
              </Button>
            </>
          ) : alreadyVerifiedPhone ? null : normalizedPhone ? (
            <Button
              type="button"
              onClick={sendPhoneCode}
              disabled={phoneSendLoading}
              className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
            >
              {phoneSendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Send code
            </Button>
          ) : null}
        </ButtonGroup>
      </div>

      <div className="md:col-span-2">
        <div className="flex items-center justify-between rounded-[1.7rem] border border-[#d7e6de] bg-white px-5 py-4">
          <div className="space-y-1 pr-4">
            <p className="text-sm font-medium text-[#1a3d34]">Text confirmations and pickup reminders</p>
            <p className="text-sm text-[#5a7a6e]">
              {alreadyVerifiedPhone
                ? "Use your verified number for reservation updates."
                : "Verify your mobile number to manage SMS updates."}
            </p>
          </div>
          <Switch
            checked={smsOptIn}
            disabled={!alreadyVerifiedPhone}
            onCheckedChange={setSmsOptIn}
          />
        </div>
      </div>

      <div className="md:col-span-2 flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saveLoading || !canSave}
          className="booking-primary-button h-12 rounded-full px-5"
        >
          {saveLoading ? <Loader2 className="size-4 animate-spin" /> : null}
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-full border-[#d7e6de] px-5 text-[#1a3d34]"
          onClick={() => {
            setFirstName(initialFirstName);
            setLastName(initialLastName);
            setEmail(initialEmail);
            setPhone(initialPhone);
            setSmsOptIn(initialSmsOptIn);
            setKnownVerifiedEmail(initialEmailVerified ? normalizeEmail(initialEmail) : null);
            setKnownVerifiedPhone(initialPhoneVerified ? normalizeClientPhone(initialPhone) : null);
            setEmailChallengeId(null);
            setPhoneChallengeId(null);
            setEmailCode("");
            setPhoneCode("");
            setEmailCodeSent(false);
            setPhoneCodeSent(false);
            setEmailResendCooldown(0);
            setPhoneResendCooldown(0);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
