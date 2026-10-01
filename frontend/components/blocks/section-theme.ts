import { cn } from "@/lib/utils";

export type SectionTheme = "white" | "cream" | "green";

export function sectionThemeClass(theme: SectionTheme | null | undefined) {
  return cn(
    theme === "green" && "bg-forest-floor text-birch-bark [--section-accent:var(--color-campfire-amber)] [--section-surface:var(--color-forest-floor)]",
    theme === "cream" && "bg-birch-bark text-pine-night [--section-accent:var(--color-cedar)] [--section-surface:var(--color-birch-bark)]",
    (!theme || theme === "white") && "bg-birch-bark-bright text-pine-night [--section-accent:var(--color-cedar)] [--section-surface:var(--color-birch-bark-bright)]",
  );
}
