"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";
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
  const [confirmSmsDisableOpen, setConfirmSmsDisableOpen] = useState(false);
  const hydratedRef = useRef(false);
  const lastPersistedRef = useRef({
    firstName: initialFirstName,
    lastName: initialLastName,
    smsOptIn: initialSmsOptIn,
  });
  const autosaveTimerRef = useRef<number | null>(null);

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const normalizedPhone = useMemo(() => normalizeClientPhone(phone) || null, [phone]);
  const initialNormalizedEmail = useMemo(() => normalizeEmail(initialEmail), [initialEmail]);
  const initialNormalizedPhone = useMemo(
    () => normalizeClientPhone(initialPhone) || null,
    [initialPhone],
  );
  const alreadyVerifiedEmail = Boolean(normalizedEmail && knownVerifiedEmail === normalizedEmail);
  const alreadyVerifiedPhone = Boolean(normalizedPhone && knownVerifiedPhone === normalizedPhone);
  const emailChanged = normalizedEmail !== initialNormalizedEmail;
  const phoneChanged = normalizedPhone !== initialNormalizedPhone;
  const canSendEmailCode = Boolean(normalizedEmail);
  const canSendPhoneCode = Boolean(normalizedPhone);
  const canSave =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    Boolean(normalizedEmail) &&
    Boolean(normalizedPhone);

  function handleSmsOptInChange(nextChecked: boolean) {
    if (!alreadyVerifiedPhone) {
      return;
    }

    if (!nextChecked && smsOptIn) {
      setConfirmSmsDisableOpen(true);
      return;
    }

    setSmsOptIn(nextChecked);
  }

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

  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    if (!canSave || emailChanged || phoneChanged) {
      return;
    }

    const changed =
      firstName !== lastPersistedRef.current.firstName ||
      lastName !== lastPersistedRef.current.lastName ||
      smsOptIn !== lastPersistedRef.current.smsOptIn;

    if (!changed) {
      return;
    }

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      void persistProfile()
        .then(() => {
          lastPersistedRef.current = {
            firstName,
            lastName,
            smsOptIn,
          };
          router.refresh();
        })
        .catch((error) => {
          toast.error(
            error instanceof Error ? error.message : "Profile could not be updated.",
          );
        });
    }, 500);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [canSave, emailChanged, firstName, lastName, phoneChanged, router, smsOptIn]);

  async function persistProfile(overrides?: {
    emailChallengeId?: string | null;
    emailVerified?: boolean;
    phoneChallengeId?: string | null;
    phoneVerified?: boolean;
  }) {
    const fullName = `${firstName} ${lastName}`.trim();
    const payload: Record<string, unknown> = {
      email: normalizedEmail,
      emailVerified: overrides?.emailVerified ?? alreadyVerifiedEmail,
      name: fullName,
      phone,
      phoneVerified: overrides?.phoneVerified ?? alreadyVerifiedPhone,
      policyAgreed: false,
      purpose: "profile-update",
      smsOptIn,
    };

    const resolvedEmailChallengeId =
      overrides?.emailChallengeId === undefined
        ? emailChallengeId
        : overrides.emailChallengeId;
    const resolvedPhoneChallengeId =
      overrides?.phoneChallengeId === undefined
        ? phoneChallengeId
        : overrides.phoneChallengeId;

    if (resolvedEmailChallengeId) {
      payload.emailChallengeId = resolvedEmailChallengeId;
    }

    if (resolvedPhoneChallengeId) {
      payload.phoneChallengeId = resolvedPhoneChallengeId;
    }

    const response = await fetch("/api/client-auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof data.error === "string" ? data.error : "Profile could not be updated.",
      );
    }
  }

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
    toast.success(`Verification code sent to ${normalizedEmail}.`);
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

    const verifiedChallengeId =
      typeof data.challengeId === "string" ? data.challengeId : emailChallengeId;

    try {
      await persistProfile({
        emailChallengeId: verifiedChallengeId,
        emailVerified: true,
      });
      lastPersistedRef.current = {
        firstName,
        lastName,
        smsOptIn,
      };
      setEmailChallengeId(null);
      setKnownVerifiedEmail(normalizedEmail);
      setEmailCodeSent(false);
      setEmailCode("");
      setEmailResendCooldown(0);
      toast.success("Email verified.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Profile could not be updated.",
      );
    }
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

    const verifiedChallengeId =
      typeof data.challengeId === "string" ? data.challengeId : phoneChallengeId;

    try {
      await persistProfile({
        phoneChallengeId: verifiedChallengeId,
        phoneVerified: true,
      });
      lastPersistedRef.current = {
        firstName,
        lastName,
        smsOptIn,
      };
      setPhoneChallengeId(null);
      setKnownVerifiedPhone(normalizedPhone);
      setPhoneCodeSent(false);
      setPhoneCode("");
      setPhoneResendCooldown(0);
      toast.success("Mobile number verified.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Profile could not be updated.",
      );
    }
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
              <SeatacPrimaryButton
                type="button"
                onClick={verifyEmailCode}
                disabled={emailVerifyLoading || emailCode.trim().length !== 6}
                className="h-14 min-w-40 px-5 shadow-none"
              >
                {emailVerifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Verify
              </SeatacPrimaryButton>
            </>
          ) : alreadyVerifiedEmail ? null : normalizedEmail ? (
            <SeatacPrimaryButton
              type="button"
              onClick={sendEmailCode}
              disabled={emailSendLoading}
              className="h-14 min-w-40 px-5 shadow-none"
            >
              {emailSendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Send code
            </SeatacPrimaryButton>
          ) : null}
        </ButtonGroup>
        {emailCodeSent && !alreadyVerifiedEmail ? (
          <p className="text-xs text-[#5a7a6e]">
            Code sent to {normalizedEmail}. Check spam or promotions if you don&apos;t see it.
          </p>
        ) : null}
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
              <SeatacPrimaryButton
                type="button"
                onClick={verifyPhoneCode}
                disabled={phoneVerifyLoading || phoneCode.trim().length !== 6}
                className="h-14 min-w-40 px-5 shadow-none"
              >
                {phoneVerifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Verify
              </SeatacPrimaryButton>
            </>
          ) : alreadyVerifiedPhone ? null : normalizedPhone ? (
            <SeatacPrimaryButton
              type="button"
              onClick={sendPhoneCode}
              disabled={phoneSendLoading}
              className="h-14 min-w-40 px-5 shadow-none"
            >
              {phoneSendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Send code
            </SeatacPrimaryButton>
          ) : null}
        </ButtonGroup>
      </div>

      <div className="space-y-3 md:col-span-2">
        <label
          htmlFor="account-sms-opt-in"
          className={`flex items-start gap-3 py-1 ${
            alreadyVerifiedPhone ? "cursor-pointer" : "cursor-not-allowed opacity-60"
          }`}
        >
          <Checkbox
            id="account-sms-opt-in"
            checked={smsOptIn}
            disabled={!alreadyVerifiedPhone}
            onCheckedChange={(checked) => {
              handleSmsOptInChange(checked === true);
            }}
            className="mt-0.5 size-5 rounded-md border-[#2d6a4f]/35 bg-white shadow-[0_2px_10px_rgba(45,106,79,0.08)] data-checked:border-[#2d6a4f] data-checked:bg-[#2d6a4f] [&_[data-slot=checkbox-indicator]>svg]:size-4"
          />
          <div className="space-y-1">
            <div className="text-sm font-medium text-[#1a3d34]">
              Text confirmations and pickup reminders
            </div>
            <div className="text-sm text-[#5a7a6e]">
              {alreadyVerifiedPhone
                ? "By checking this box, you agree to receive reservation updates from seatac.co at the mobile number above. Message frequency varies. Reply STOP to opt out, HELP for help. Msg & data rates may apply. See our privacy policy and SMS policy."
                : "Verify your mobile number to manage SMS updates."}
            </div>
          </div>
        </label>
      </div>

      <Dialog open={confirmSmsDisableOpen} onOpenChange={setConfirmSmsDisableOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md rounded-[1.75rem] border border-[#d7e6de] bg-white p-0"
        >
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle className="text-[#1a3d34]">
              Turn off text confirmations?
            </DialogTitle>
            <DialogDescription className="text-[#5a7a6e]">
              Are you sure you do not want to receive booking confirmations, pickup reminders,
              and trip updates by text?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 rounded-b-[1.75rem] border-t border-[#d7e6de] bg-[#f6f8f5] px-6 pb-6 pt-4">
            <button
              type="button"
              className="inline-flex h-11 min-w-36 items-center justify-center rounded-full border border-[#d7e6de] bg-white px-5 text-sm font-medium text-[#1a3d34] transition-colors hover:bg-[#eef4f0]"
              onClick={() => {
                setSmsOptIn(false);
                setConfirmSmsDisableOpen(false);
              }}
            >
              Turn off texts
            </button>
            <SeatacPrimaryButton
              type="button"
              className="h-11 min-w-36 px-5"
              onClick={() => setConfirmSmsDisableOpen(false)}
            >
              Keep texts on
            </SeatacPrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
