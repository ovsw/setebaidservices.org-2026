import { cn } from "@/lib/utils";

/*
 * The three editor backgrounds. The stored values keep their CAC names so
 * existing documents resolve; Studio shows them as Cream, Sand and Forest.
 * Each maps to a field utility in globals.css, which paints the ground and
 * re-points the job tokens (foreground, link, ring, card…) for everything
 * inside the section. See DESIGN.md § Colors → Fields.
 */
export type SectionTheme = "white" | "cream" | "green";

export function sectionThemeClass(theme: SectionTheme | null | undefined) {
  return cn(
    theme === "green" && "field-forest",
    theme === "cream" && "field-sand",
    (!theme || theme === "white") && "field-cream",
  );
}

export type LightGlow = "sunrise" | "left" | "right" | "corners" | "top";

/**
 * The light-field glow for a section, or nothing on the Forest field, where
 * the band glow in globals.css lights the section instead.
 */
export function lightGlowClass(theme: SectionTheme | null | undefined, glow: LightGlow) {
  if (theme === "green") return undefined;
  return {
    sunrise: "glow-sunrise",
    left: "glow-left",
    right: "glow-right",
    corners: "glow-corners",
    top: "glow-top",
  }[glow];
}
