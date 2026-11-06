"use client";

import { sendParentsGuide } from "@/app/actions/parents-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackVisitEvent } from "@/components/visit-analytics";
import { HONEYPOT_FIELD } from "@/lib/ask-about-camp";
import {
  type ParentsGuideErrors,
  type ParentsGuideField,
  type ParentsGuideResult,
  validateParentsGuide,
} from "@/lib/parents-guide";
import { currentVisitSource } from "@/lib/visit-source";
import Link from "next/link";
import { type FormEvent, startTransition, useActionState, useEffect, useRef, useState } from "react";

type ParentsGuideFieldsProps = {
  /** Click-to-edit targets, computed on the server. */
  editing: Partial<Record<"errorMessage" | "privacyLine" | "successMessage", string>>;
  errorMessage: string;
  officePhone?: string;
  privacyLine: string;
  successMessage: string;
};

const FIELD_ORDER: ParentsGuideField[] = ["firstName", "email"];
const initialState: ParentsGuideResult = { status: "idle" };

function focusFirstError(form: HTMLFormElement | null, found: ParentsGuideErrors) {
  const first = FIELD_ORDER.find((field) => found[field]);
  if (first) form?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
}

function TextField({
  autoComplete,
  error,
  label,
  name,
  onEdit,
  type = "text",
}: {
  autoComplete: string;
  error?: string;
  label: string;
  name: ParentsGuideField;
  onEdit: (name: ParentsGuideField) => void;
  type?: "email" | "text";
}) {
  const id = `parents-guide-${name}`;
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[15px] font-semibold leading-snug" htmlFor={id}>
        {label}
        {/* The input's required attribute tells screen readers; the star is for the eye. */}
        <span aria-hidden="true" className="text-destructive">
          {" "}*
        </span>
      </Label>
      <Input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        autoComplete={autoComplete}
        className="border-[1.5px] bg-popover text-popover-foreground"
        id={id}
        name={name}
        onInput={() => onEdit(name)}
        required
        type={type}
      />
      {error ? (
        <p className="font-ui text-sm/[1.4] font-medium text-destructive" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ParentsGuideFields({
  editing,
  errorMessage,
  officePhone,
  privacyLine,
  successMessage,
}: ParentsGuideFieldsProps) {
  const [state, formAction, pending] = useActionState(sendParentsGuide, initialState);
  const [clientErrors, setClientErrors] = useState<ParentsGuideErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);

  const errors = Object.keys(clientErrors).length
    ? clientErrors
    : state.status === "invalid"
      ? state.errors
      : {};

  useEffect(() => {
    if (state.status === "sent") {
      // Only the Source and the page: no answer from the form.
      trackVisitEvent("form_sent");
      thanksRef.current?.focus();
    }
    if (state.status === "failed") failedRef.current?.focus();
    if (state.status === "invalid") focusFirstError(formRef.current, state.errors);
  }, [state]);

  // A corrected answer drops its own error; the other fields keep theirs.
  function clearError(name: ParentsGuideField) {
    setClientErrors((current) => {
      if (!current[name]) return current;
      const rest = { ...current };
      delete rest[name];
      return rest;
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    // Sent by hand, not through the form's action, so React does not clear
    // the answers when the server refuses them.
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const checked = validateParentsGuide(formData);
    if (!checked.ok) {
      setClientErrors(checked.errors);
      focusFirstError(event.currentTarget, checked.errors);
      return;
    }
    setClientErrors({});

    const visit = currentVisitSource();
    formData.set("source", visit.source);
    if (visit.campaign) formData.set("campaign", visit.campaign);
    formData.set("page", window.location.pathname);
    startTransition(() => formAction(formData));
  }

  // A soft card: one step lighter than the field, flat at rest.
  const panel = "rounded-card border-[1.5px] border-border bg-card p-6 text-card-foreground sm:p-10";

  if (state.status === "sent") {
    return (
      <div className="field-cream self-start rounded-card">
        <div className={`${panel} outline-none`} ref={thanksRef} role="status" tabIndex={-1}>
          <p
            className="whitespace-pre-line text-pretty text-lg/[1.6] font-medium"
            data-sanity={editing.successMessage}
          >
            {successMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    // The panel keeps the light field's colours on every background, so
    // the labels, borders and error text stay readable on Forest.
    <div className="field-cream self-start rounded-card">
      <form className={`${panel} relative flex flex-col gap-8`} noValidate onSubmit={submit} ref={formRef}>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            autoComplete="given-name"
            error={errors.firstName}
            label="First name"
            name="firstName"
            onEdit={clearError}
          />
          <TextField
            autoComplete="email"
            error={errors.email}
            label="Email"
            name="email"
            onEdit={clearError}
            type="email"
          />
        </div>

        {/* Only a bot fills this in; people never see or reach it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            Fax
            <input autoComplete="off" name={HONEYPOT_FIELD} tabIndex={-1} type="text" />
          </label>
        </div>

        {state.status === "failed" ? (
          <div
            className="rounded-control border border-destructive/40 bg-destructive/5 p-4 outline-none"
            ref={failedRef}
            role="alert"
            tabIndex={-1}
          >
            <p className="whitespace-pre-line text-pretty" data-sanity={editing.errorMessage}>
              {errorMessage}
            </p>
            {officePhone ? (
              <p className="mt-2 font-semibold">
                Call the office:{" "}
                <a className="text-link underline underline-offset-4" href={`tel:${officePhone.replace(/[^+\d]/g, "")}`}>
                  {officePhone}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          <Button className="w-full sm:w-auto sm:self-start" disabled={pending} type="submit">
            {pending ? "Sending…" : "Send me the guide"}
          </Button>
          <p className="max-w-[52ch] text-pretty text-sm/[1.6] text-muted-foreground">
            <span data-sanity={editing.privacyLine}>{privacyLine}</span>{" "}
            <Link className="text-link underline underline-offset-4" href="/privacy-policy">
              Privacy policy
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
