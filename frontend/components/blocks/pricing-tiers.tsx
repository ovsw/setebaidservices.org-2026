import { cn } from "@/lib/utils";
import type { HOME_PAGE_QUERY_RESULT, PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import {
  HeadingText,
  hasText,
  resolveButton,
  SectionButtonLink,
  type DataAttribute,
} from "./section-parts";
import { lightGlowClass, sectionThemeClass } from "./section-theme";

type PageBlock =
  | NonNullable<NonNullable<HOME_PAGE_QUERY_RESULT>["blocks"]>[number]
  | NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type PricingTiersProps = Extract<PageBlock, { _type: "pricingTiers" }> & {
  dataAttribute?: DataAttribute;
};

/*
 * Pricing Tiers (prototype "Pricing"): each tier is a row with its name, a
 * bar and the fee. The highest fee is the full cost of camp. For every other
 * tier the bar shows the family's share in camp green and what donors cover
 * in striped marigold. The application tier sits below a dashed tear line on
 * a lake tint. Prices come from Sanity only; this repository is public.
 */

const formatDollars = (value: number) => `$${value.toLocaleString("en-US")}`;

/** The family's share of the full cost, and what donors cover. */
export function tierShare(price: number, fullCost: number) {
  if (fullCost <= 0 || price >= fullCost) return { covered: 0, share: 100 };
  return {
    covered: fullCost - price,
    share: Math.round((Math.max(price, 0) / fullCost) * 1000) / 10,
  };
}

const DONOR_STRIPES =
  "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-highlight) 50%, var(--color-card)) 0 7px, color-mix(in oklab, var(--color-highlight) 28%, var(--color-card)) 7px 14px)";

function TierBar({ fullCost, price }: { fullCost: number; price: number }) {
  const { covered, share } = tierShare(price, fullCost);
  return (
    <div className="flex h-11 overflow-hidden rounded-sm font-ui text-sm font-bold whitespace-nowrap tabular-nums">
      {covered === 0 ? (
        <div className="flex min-w-0 flex-1 items-center bg-primary px-4 text-primary-foreground">
          Full cost, no subsidy
        </div>
      ) : (
        <>
          <div className="min-w-1.5 bg-primary" style={{ flex: `0 0 ${share}%` }} />
          <div
            className="flex min-w-0 flex-1 items-center justify-end px-4 text-card-foreground"
            style={{ background: DONOR_STRIPES }}
          >
            Donors cover {formatDollars(covered)}
          </div>
        </>
      )}
    </div>
  );
}

export default function PricingTiers({
  _key,
  background,
  dataAttribute,
  eyebrow,
  intro,
  link,
  notes,
  panelNote,
  panelTitle,
  tiers,
  title,
}: PricingTiersProps) {
  const rows = (tiers ?? []).filter((tier) => typeof tier.price === "number");
  if (!title?.length || !rows.length) return null;

  const headingId = `pricing-tiers-${stegaClean(_key)}-title`;
  const fullCost = Math.max(...rows.map((tier) => tier.price as number));
  const footLink = resolveButton(link);

  return (
    <section
      aria-labelledby={headingId}
      className={cn("py-section", sectionThemeClass(background),
        lightGlowClass(background, "top"),
      )}
    >
      <div className="container-content flex flex-col gap-12">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-end gap-x-16 gap-y-6">
          <div className="flex flex-col gap-4">
            {hasText(eyebrow) ? (
              <p className="font-ui text-eyebrow text-link" data-sanity={dataAttribute?.("eyebrow")}>
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-headline" data-sanity={dataAttribute?.("title")} id={headingId}>
              <HeadingText value={title} />
            </h2>
          </div>
          {hasText(intro) ? (
            <p className="text-lead text-muted-foreground" data-sanity={dataAttribute?.("intro")}>
              {intro}
            </p>
          ) : null}
        </div>

        <div
          className="flex flex-col gap-2 rounded-card bg-card p-(--pad-panel) text-card-foreground shadow-[inset_0_0_0_1.5px_var(--color-border)] [--pad-panel:clamp(16px,3vw,32px)]"
          data-sanity={dataAttribute?.("tiers")}
        >
          {hasText(panelTitle) || hasText(panelNote) ? (
            <div className="flex flex-col gap-2 px-3 sm:px-6">
              {hasText(panelTitle) ? (
                <h3 className="text-title" data-sanity={dataAttribute?.("panelTitle")}>
                  {panelTitle}
                </h3>
              ) : null}
              {hasText(panelNote) ? (
                <p
                  className="max-w-[60ch] text-body leading-[1.6] text-muted-foreground"
                  data-sanity={dataAttribute?.("panelNote")}
                >
                  {panelNote}
                </p>
              ) : null}
            </div>
          ) : null}

          {rows.map((tier) => {
            const application = Boolean(stegaClean(tier.application));
            const tierPath = `tiers[_key=="${tier._key}"]`;
            return (
              <div
                className={cn(
                  "grid items-center gap-x-7 gap-y-4 lg:grid-cols-[170px_minmax(0,1fr)_260px]",
                  application
                    ? "relative mx-[calc(var(--pad-panel)*-1)] mt-4 mb-[calc(var(--pad-panel)*-1)] rounded-b-card border-t-2 border-dashed border-[color-mix(in_oklab,var(--color-fill-cool)_80%,var(--color-foreground)_20%)] bg-[color-mix(in_oklab,var(--color-fill-cool)_22%,var(--color-card))] px-[calc(var(--pad-panel)+12px)] pt-8 pb-[calc(var(--pad-panel)+24px)] sm:px-[calc(var(--pad-panel)+24px)]"
                    : "rounded-card px-3 py-5 sm:px-6",
                )}
                data-sanity={dataAttribute?.(tierPath)}
                key={tier._key}
              >
                {application ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute -top-3 -left-[11px] size-[22px] rounded-full bg-background"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute -top-3 -right-[11px] size-[22px] rounded-full bg-background"
                    />
                  </>
                ) : null}
                <div className="flex flex-col gap-2">
                  <span className="font-ui text-eyebrow text-muted-foreground">{tier.name}</span>
                  <span className="font-ui text-[1.0625rem] leading-[1.3] font-semibold">
                    {tier.label}
                  </span>
                </div>
                <TierBar fullCost={fullCost} price={tier.price as number} />
                <div className="grid grid-cols-[minmax(0,1fr)_128px] items-center gap-4">
                  <span className="text-title-lg leading-none whitespace-nowrap tabular-nums lg:text-right">
                    {formatDollars(tier.price as number)}
                  </span>
                  <SectionButtonLink
                    arrow
                    button={tier.buttons?.[0]}
                    className={cn("w-full", !application && "bg-card")}
                    dataSanity={dataAttribute?.(`${tierPath}.buttons`)}
                    // The tier sets the style: the application tier leads.
                    variant={application ? "primary" : "outline"}
                  />
                </div>
                {hasText(tier.note) ? (
                  <p className="max-w-[62ch] text-small text-muted-foreground lg:col-span-2 lg:col-start-2">
                    {tier.note}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        {notes?.length || footLink ? (
          <div className="flex flex-wrap gap-x-10 gap-y-3 font-ui text-[0.9375rem] leading-normal text-muted-foreground">
            {(notes ?? []).map((note, index) => (
              <span data-sanity={dataAttribute?.(`notes[${index}]`)} key={`${index}-${note}`}>
                {note}
              </span>
            ))}
            {footLink ? (
              <Link
                className="focus-ring text-link underline hover:text-foreground"
                data-sanity={dataAttribute?.("link")}
                href={footLink.href}
                rel={footLink.openInNewTab ? "noopener noreferrer" : undefined}
                target={footLink.openInNewTab ? "_blank" : undefined}
              >
                {footLink.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
