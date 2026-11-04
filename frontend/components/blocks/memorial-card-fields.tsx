"use client";

import { sendMemorialCard } from "@/app/actions/memorial-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackVisitEvent } from "@/components/visit-analytics";
import { HONEYPOT_FIELD } from "@/lib/ask-about-camp";
import {
  emptyMemorialCardDraft,
  firstStepWithError,
  GIVE_BY,
  type MemorialCardDraft,
  type MemorialCardErrors,
  type MemorialCardField,
  type MemorialCardResult,
  memorialCardErrors,
  OWN_WORDS,
  STEP_COUNT,
  STEP_FIELDS,
  TRIBUTES,
} from "@/lib/memorial-card";
import { currentVisitSource } from "@/lib/visit-source";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import {
  type FieldErrors,
  type Resolver,
  type UseFormRegister,
  useForm,
  useWatch,
} from "react-hook-form";

export type CardDesignChoice = {
  key: string;
  /** Shown to the donor; may carry click-to-edit data. */
  label: string;
  /** Sent to the office. */
  value: string;
  imageUrl?: string;
};

export type MessageChoice = { label: string; value: string };

type MemorialCardFieldsProps = {
  byMailLine: string;
  cards: CardDesignChoice[];
  /** Click-to-edit targets, computed on the server. */
  editing: Partial<
    Record<"byMailLine" | "cardDesigns" | "errorMessage" | "messages" | "privacyLine" | "successMessage", string>
  >;
  errorMessage: string;
  givingLink?: string;
  messages: MessageChoice[];
  officePhone?: string;
  privacyLine: string;
  successMessage: string;
};

const STEP_TITLES = ["Who you remember or honor", "Who gets the card", "Choose a card", "Your details"];

/**
 * "Next" checks only the fields React Hook Form names: the current step's.
 * The whole draft is parsed, and the errors of other steps are dropped.
 */
const stepResolver: Resolver<MemorialCardDraft> = async (values, _context, options) => {
  const found = memorialCardErrors(values, options.names);
  const errors = Object.fromEntries(
    Object.entries(found).map(([field, message]) => [field, { type: "invalid", message }]),
  ) as FieldErrors<MemorialCardDraft>;
  return Object.keys(errors).length ? { values: {}, errors } : { values, errors: {} };
};

const fieldId = (name: MemorialCardField) => `memorial-card-${name}`;

const choiceClass =
  "group flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-control border-[1.5px] border-border bg-popover px-4 py-2.5 font-ui text-[15px] leading-snug text-popover-foreground transition-colors motion-fast hover:border-link/50 has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring";

function ErrorText({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="font-ui text-sm/[1.4] font-medium text-destructive" id={id}>
      {message}
    </p>
  ) : null;
}

function TextField({
  autoComplete,
  error,
  inputMode,
  label,
  name,
  note,
  optional,
  prefix,
  register,
  type = "text",
}: {
  autoComplete?: string;
  error?: string;
  inputMode?: "decimal" | "numeric" | "tel" | "email";
  label: string;
  name: MemorialCardField;
  note?: string;
  optional?: boolean;
  prefix?: string;
  register: UseFormRegister<MemorialCardDraft>;
  type?: "email" | "tel" | "text";
}) {
  const id = fieldId(name);
  const describedBy = [note ? `${id}-note` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  const input = (
    <Input
      aria-describedby={describedBy || undefined}
      aria-invalid={error ? true : undefined}
      aria-required={optional ? undefined : true}
      autoComplete={autoComplete}
      className={cn("border-[1.5px] bg-popover text-popover-foreground", prefix && "pl-8")}
      id={id}
      inputMode={inputMode}
      type={type}
      {...register(name)}
    />
  );
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[15px] font-semibold leading-snug" htmlFor={id}>
        {label}
        {optional ? <span className="font-normal text-muted-foreground"> (optional)</span> : null}
      </Label>
      {prefix ? (
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground"
          >
            {prefix}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
      {note ? (
        <p className="text-sm/[1.5] text-muted-foreground" id={`${id}-note`}>
          {note}
        </p>
      ) : null}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  );
}

function ChoiceGroup({
  children,
  className,
  editing,
  error,
  legend,
  name,
}: {
  children: ReactNode;
  className?: string;
  editing?: string;
  error?: string;
  legend: string;
  name: MemorialCardField;
}) {
  const id = fieldId(name);
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined} className="flex flex-col gap-3">
      <legend className="mb-1 text-[15px] font-semibold leading-snug">{legend}</legend>
      <div className={className} data-sanity={editing}>
        {children}
      </div>
      <ErrorText id={`${id}-error`} message={error} />
    </fieldset>
  );
}

/** An address block: name, street, city, state and zip code, with autofill. */
function AddressFields({
  errors,
  fields,
  register,
  section,
}: {
  errors: MemorialCardErrors;
  fields: { name: MemorialCardField; street: MemorialCardField; city: MemorialCardField; state: MemorialCardField; zip: MemorialCardField };
  register: UseFormRegister<MemorialCardDraft>;
  section: string;
}) {
  const auto = (token: string) => `section-${section} ${token}`;
  return (
    <>
      <TextField autoComplete={auto("name")} error={errors[fields.name]} label="Name" name={fields.name} register={register} />
      <TextField
        autoComplete={auto("address-line1")}
        error={errors[fields.street]}
        label="Street address"
        name={fields.street}
        register={register}
      />
      <div className="grid gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)]">
        <TextField autoComplete={auto("address-level2")} error={errors[fields.city]} label="City" name={fields.city} register={register} />
        <TextField autoComplete={auto("address-level1")} error={errors[fields.state]} label="State" name={fields.state} register={register} />
        <TextField
          autoComplete={auto("postal-code")}
          error={errors[fields.zip]}
          inputMode="numeric"
          label="Zip code"
          name={fields.zip}
          register={register}
        />
      </div>
    </>
  );
}

export function MemorialCardFields({
  byMailLine,
  cards,
  editing,
  errorMessage,
  givingLink,
  messages,
  officePhone,
  privacyLine,
  successMessage,
}: MemorialCardFieldsProps) {
  const {
    clearErrors,
    control,
    formState,
    getValues,
    register: registerField,
    setError,
    trigger,
  } = useForm<MemorialCardDraft>({
    defaultValues: emptyMemorialCardDraft,
    resolver: stepResolver,
  });
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<MemorialCardResult>({ status: "idle" });
  const [pending, startSending] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const thanksRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const [tribute, messageChoice, giveBy] = useWatch({ control, name: ["tribute", "messageChoice", "giveBy"] });

  const errors = Object.fromEntries(
    Object.entries(formState.errors).map(([field, error]) => [field, error?.message]),
  ) as MemorialCardErrors;

  // Once a field shows an error, it is checked again as the donor fixes it.
  const register: UseFormRegister<MemorialCardDraft> = (name, options) =>
    registerField(name, {
      ...options,
      onChange: () => {
        if (formState.errors[name]) void trigger(name);
      },
    });

  // Next and Back move focus to the new step's heading, which names the step.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (result.status === "sent") {
      // Only the Source and the page: no answer from the form.
      trackVisitEvent("form_sent");
      thanksRef.current?.focus();
    }
    if (result.status === "failed") failedRef.current?.focus();
  }, [result]);

  function goTo(next: number) {
    moved.current = true;
    setStep(next);
  }

  function showErrors(found: MemorialCardErrors) {
    for (const [field, message] of Object.entries(found)) {
      setError(field as MemorialCardField, { type: "invalid", message });
    }
    const errorStep = firstStepWithError(found);
    if (errorStep !== undefined && errorStep !== step) goTo(errorStep);
  }

  function send() {
    const formData = new FormData();
    for (const [field, value] of Object.entries(getValues())) formData.set(field, value);
    const honeypot = formRef.current?.elements.namedItem(HONEYPOT_FIELD);
    if (honeypot instanceof HTMLInputElement) formData.set(HONEYPOT_FIELD, honeypot.value);
    const visit = currentVisitSource();
    formData.set("source", visit.source);
    if (visit.campaign) formData.set("campaign", visit.campaign);
    formData.set("page", window.location.pathname);

    startSending(async () => {
      try {
        const answer = await sendMemorialCard(formData);
        if (answer.status === "invalid") showErrors(answer.errors);
        setResult(answer);
      } catch {
        setResult({ status: "failed" });
      }
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    // Enter in a field means "Next" until the last step; the browser never
    // sends the form itself.
    event.preventDefault();
    if (pending) return;
    if (!(await trigger(STEP_FIELDS[step], { shouldFocus: true }))) return;
    if (step < STEP_COUNT - 1) {
      goTo(step + 1);
      return;
    }
    const found = memorialCardErrors(getValues());
    if (Object.keys(found).length) {
      showErrors(found);
      return;
    }
    clearErrors();
    send();
  }

  // A soft card: one step lighter than the field, flat at rest.
  const panel = "rounded-card border-[1.5px] border-border bg-card p-6 text-card-foreground sm:p-10";

  if (result.status === "sent") {
    const mailFirst = giveBy === "check";
    const mailLine = (
      <p
        className={cn("whitespace-pre-line text-pretty", mailFirst ? "text-lg/[1.6]" : "text-base/[1.6] text-muted-foreground")}
        data-sanity={editing.byMailLine}
      >
        {byMailLine}
      </p>
    );
    return (
      <div className="field-cream self-start rounded-card">
        <div className={`${panel} flex flex-col gap-6 outline-none`} ref={thanksRef} role="status" tabIndex={-1}>
          <p className="whitespace-pre-line text-pretty text-lg/[1.6] font-medium" data-sanity={editing.successMessage}>
            {successMessage}
          </p>
          {mailFirst ? mailLine : null}
          {givingLink && !mailFirst ? (
            <Button asChild className="w-full sm:w-auto sm:self-start" variant="highlight">
              <a href={givingLink} rel="noopener noreferrer" target="_blank">
                Give in Camp Brain
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          ) : null}
          {mailFirst ? null : mailLine}
        </div>
      </div>
    );
  }

  const last = step === STEP_COUNT - 1;

  return (
    // The panel keeps the light field's colours on every background, so
    // the labels, borders and error text stay readable on Forest.
    <div className="field-cream rounded-card">
      <form className={`${panel} relative flex flex-col gap-8`} noValidate onSubmit={submit} ref={formRef}>
        <div className="flex flex-col gap-4">
          <ol aria-hidden="true" className="grid grid-cols-4 gap-2">
            {STEP_TITLES.map((title, index) => (
              <li
                className={cn("h-1.5 rounded-pill", index <= step ? "bg-primary" : "bg-border")}
                key={title}
              />
            ))}
          </ol>
          <h3
            className="flex flex-col gap-1 font-display text-2xl/[1.2] font-extrabold text-balance outline-none"
            ref={headingRef}
            tabIndex={-1}
          >
            <span className="font-ui text-sm font-semibold tracking-wide text-muted-foreground">
              Step {step + 1} of {STEP_COUNT}
            </span>
            {STEP_TITLES[step]}
          </h3>
        </div>

        {step === 0 ? (
          <div className="flex flex-col gap-6">
            <ChoiceGroup className="grid gap-2.5 sm:grid-cols-2" error={errors.tribute} legend="This gift is" name="tribute">
              {(Object.keys(TRIBUTES) as (keyof typeof TRIBUTES)[]).map((key) => (
                <label className={choiceClass} key={key}>
                  <input className="size-4 accent-primary" type="radio" value={key} {...register("tribute")} />
                  {TRIBUTES[key]}
                </label>
              ))}
            </ChoiceGroup>
            <TextField
              autoComplete="off"
              error={errors.honoreeName}
              label="The person's full name"
              name="honoreeName"
              register={register}
            />
            {tribute === "honor" ? (
              <TextField
                autoComplete="off"
                error={errors.occasion}
                label="The occasion, for example a birthday"
                name="occasion"
                optional
                register={register}
              />
            ) : null}
            <TextField
              autoComplete="off"
              error={errors.amount}
              inputMode="decimal"
              label="Gift amount"
              name="amount"
              note="We do not tell the family the amount."
              prefix="$"
              register={register}
            />
            <ChoiceGroup className="grid gap-2.5 sm:grid-cols-2" error={errors.giveBy} legend="How will you give?" name="giveBy">
              {(Object.keys(GIVE_BY) as (keyof typeof GIVE_BY)[]).map((key) => (
                <label className={choiceClass} key={key}>
                  <input className="size-4 accent-primary" type="radio" value={key} {...register("giveBy")} />
                  {GIVE_BY[key]}
                </label>
              ))}
            </ChoiceGroup>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <AddressFields
              errors={errors}
              fields={{
                name: "recipientName",
                street: "recipientStreet",
                city: "recipientCity",
                state: "recipientState",
                zip: "recipientZip",
              }}
              register={register}
              section="card shipping"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-8">
            <ChoiceGroup
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              editing={editing.cardDesigns}
              error={errors.cardDesign}
              legend="Card design"
              name="cardDesign"
            >
              {cards.map((card) => (
                <label
                  className="group relative flex cursor-pointer flex-col gap-2 rounded-control border-[1.5px] border-border bg-popover p-2 text-popover-foreground transition-colors motion-fast hover:border-link/50 has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
                  key={card.key}
                >
                  <input className="sr-only" type="radio" value={card.value} {...register("cardDesign")} />
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-[calc(var(--radius-control)-4px)] bg-muted">
                    {card.imageUrl ? (
                      <Image alt="" className="object-contain p-2" fill sizes="(min-width: 640px) 200px, 45vw" src={card.imageUrl} />
                    ) : null}
                  </span>
                  <span className="flex items-start gap-1.5 px-1 pb-1 font-ui text-[15px] leading-snug">
                    <Check aria-hidden="true" className="mt-0.5 hidden size-4 shrink-0 text-primary group-has-[:checked]:block" />
                    {card.label}
                  </span>
                </label>
              ))}
            </ChoiceGroup>
            <ChoiceGroup
              className="flex flex-col gap-2.5"
              editing={editing.messages}
              error={errors.messageChoice}
              legend="The words printed inside"
              name="messageChoice"
            >
              {messages.map((message) => (
                <label className={choiceClass} key={message.value}>
                  <input className="size-4 shrink-0 accent-primary" type="radio" value={message.value} {...register("messageChoice")} />
                  {message.label}
                </label>
              ))}
              <label className={choiceClass}>
                <input className="size-4 shrink-0 accent-primary" type="radio" value={OWN_WORDS} {...register("messageChoice")} />
                Other: my own words
              </label>
            </ChoiceGroup>
            {messageChoice === OWN_WORDS ? (
              <div className="flex flex-col gap-2">
                <Label className="text-[15px] font-semibold leading-snug" htmlFor={fieldId("customMessage")}>
                  Your words for the card
                </Label>
                <textarea
                  aria-describedby={errors.customMessage ? `${fieldId("customMessage")}-error` : undefined}
                  aria-invalid={errors.customMessage ? true : undefined}
                  aria-required="true"
                  className="min-h-28 w-full rounded-control border-[1.5px] border-input bg-popover px-3.5 py-3 text-base text-popover-foreground focus-ring"
                  id={fieldId("customMessage")}
                  maxLength={500}
                  {...register("customMessage")}
                />
                <ErrorText id={`${fieldId("customMessage")}-error`} message={errors.customMessage} />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-5">
            <AddressFields
              errors={errors}
              fields={{
                name: "donorName",
                street: "donorStreet",
                city: "donorCity",
                state: "donorState",
                zip: "donorZip",
              }}
              register={register}
              section="donor billing"
            />
            <p className="text-sm/[1.5] text-muted-foreground">We contact you only if we have a question about your card.</p>
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                autoComplete="section-donor billing tel"
                error={errors.donorPhone}
                inputMode="tel"
                label="Phone"
                name="donorPhone"
                register={register}
                type="tel"
              />
              <TextField
                autoComplete="section-donor billing email"
                error={errors.donorEmail}
                inputMode="email"
                label="Email"
                name="donorEmail"
                register={register}
                type="email"
              />
            </div>
          </div>
        ) : null}

        {/* Only a bot fills this in; people never see or reach it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            Fax
            <input autoComplete="off" name={HONEYPOT_FIELD} tabIndex={-1} type="text" />
          </label>
        </div>

        {result.status === "failed" ? (
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
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {step > 0 ? (
              <Button className="w-full sm:w-auto" disabled={pending} onClick={() => goTo(step - 1)} type="button" variant="outline">
                Back
              </Button>
            ) : null}
            <Button className="w-full sm:w-auto" disabled={pending} type="submit">
              {last ? (pending ? "Sending…" : "Send the card details") : "Next"}
            </Button>
          </div>
          {last ? (
            <p className="max-w-[52ch] text-pretty text-sm/[1.6] text-muted-foreground">
              <span data-sanity={editing.privacyLine}>{privacyLine}</span>{" "}
              <Link className="text-link underline underline-offset-4" href="/privacy-policy">
                Privacy policy
              </Link>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
