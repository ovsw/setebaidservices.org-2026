"use client";

import { sendAskAboutCamp } from "@/app/actions/ask-about-camp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackVisitEvent } from "@/components/visit-analytics";
import {
  DIRECTOR_HASH,
  HONEYPOT_FIELD,
  type AskAboutCampErrors,
  type AskAboutCampField,
  type AskAboutCampResult,
  validateAskAboutCamp,
} from "@/lib/ask-about-camp";
import { currentVisitSource } from "@/lib/visit-source";
import { Check } from "lucide-react";
import Link from "next/link";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

type Choice = { label: string; value: string };

type AskAboutCampFieldsProps = {
  choices: Choice[];
  director: Choice;
  /** Click-to-edit targets, computed on the server. */
  editing: Partial<Record<"errorMessage" | "privacyLine" | "successMessage" | "topics", string>>;
  errorMessage: string;
  officePhone?: string;
  privacyLine: string;
  successMessage: string;
};

const FIELD_ORDER: AskAboutCampField[] = ["name", "phone", "email", "childAge", "bestTime"];
const initialState: AskAboutCampResult = { status: "idle" };

function focusFirstError(form: HTMLFormElement | null, found: AskAboutCampErrors) {
  const first = FIELD_ORDER.find((field) => found[field]);
  if (first) form?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
}

function TextField({
  autoComplete,
  error,
  label,
  name,
  optional,
  type = "text",
}: {
  autoComplete?: string;
  error?: string;
  label: string;
  name: AskAboutCampField;
  optional?: boolean;
  type?: "email" | "tel" | "text";
}) {
  const id = `ask-about-camp-${name}`;
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[15px] font-semibold leading-snug" htmlFor={id}>
        {label}
        {optional ? <span className="font-normal text-muted-foreground"> (optional)</span> : null}
      </Label>
      <Input
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        autoComplete={autoComplete}
        className="border-[1.5px] bg-popover text-popover-foreground"
        id={id}
        name={name}
        required={!optional}
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

export function AskAboutCampFields({
  choices,
  director,
  editing,
  errorMessage,
  officePhone,
  privacyLine,
  successMessage,
}: AskAboutCampFieldsProps) {
  const [state, formAction, pending] = useActionState(sendAskAboutCamp, initialState);
  const [clientErrors, setClientErrors] = useState<AskAboutCampErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const directorRef = useRef<HTMLInputElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);

  const errors = Object.keys(clientErrors).length
    ? clientErrors
    : state.status === "invalid"
      ? state.errors
      : {};

  // A "Talk to the director" link opens the form with that choice ticked.
  // A Next.js link on the same page changes the hash without a hashchange
  // event, so clicks on such links are watched too.
  useEffect(() => {
    const tickDirector = () => {
      if (directorRef.current) directorRef.current.checked = true;
    };
    const onHashChange = () => {
      if (window.location.hash === DIRECTOR_HASH) tickDirector();
    };
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        link instanceof HTMLAnchorElement &&
        link.hash === DIRECTOR_HASH &&
        link.pathname === window.location.pathname
      ) {
        tickDirector();
      }
    };
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (state.status === "sent") {
      // Only the Source and the page: no answer from the form.
      trackVisitEvent("form_sent");
      thanksRef.current?.focus();
    }
    if (state.status === "failed") failedRef.current?.focus();
    if (state.status === "invalid") focusFirstError(formRef.current, state.errors);
  }, [state]);

  function submit(event: FormEvent<HTMLFormElement>) {
    // Sent by hand, not through the form's action, so React does not clear
    // the answers when the server refuses them.
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const checked = validateAskAboutCamp(formData);
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
      <div className="field-cream rounded-card">
        <div
          className={`${panel} outline-none`}
          ref={thanksRef}
          role="status"
          tabIndex={-1}
        >
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
    <div className="field-cream rounded-card">
      <form className={`${panel} relative flex flex-col gap-10`} noValidate onSubmit={submit} ref={formRef}>
        {/* Groups: how to reach you, your child, your questions, send. */}
        <div className="flex flex-col gap-5">
          <TextField autoComplete="name" error={errors.name} label="Your name" name="name" />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField autoComplete="tel" error={errors.phone} label="Phone" name="phone" type="tel" />
            <TextField autoComplete="email" error={errors.email} label="Email" name="email" type="email" />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField error={errors.childAge} label="Your child's age" name="childAge" />
          <TextField error={errors.bestTime} label="Best time to call" name="bestTime" optional />
        </div>

        <fieldset>
          <legend className="mb-4 text-[15px] font-semibold leading-snug">
            What would you like to know?
            <span className="font-normal text-muted-foreground"> (optional)</span>
          </legend>
          <div className="flex flex-wrap gap-2.5" data-sanity={editing.topics}>
            {[...choices, director].map((choice) => (
              <label
                className="group inline-flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-pill border-[1.5px] border-border bg-popover px-4 font-ui text-[15px] leading-snug text-popover-foreground transition-colors motion-fast hover:border-link/50 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                key={choice.value}
              >
                <input
                  className="sr-only"
                  name="interests"
                  ref={choice === director ? directorRef : undefined}
                  type="checkbox"
                  value={choice.value}
                />
                <Check aria-hidden="true" className="-ml-1 hidden size-4 group-has-[:checked]:block" />
                {choice.label}
              </label>
            ))}
          </div>
        </fieldset>

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
            {pending ? "Sending…" : "Send my request"}
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
