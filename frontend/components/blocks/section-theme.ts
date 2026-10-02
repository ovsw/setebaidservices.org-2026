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
