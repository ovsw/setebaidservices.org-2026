import { askAboutCampEmails } from "./ask-about-camp.ts";
import { parentsGuideEmails } from "./parents-guide.ts";
import type { FormEmails } from "./layout.ts";

/** Every form's emails, in the order `pnpm form-emails` previews and pushes them. */
export const formEmails: FormEmails[] = [askAboutCampEmails, parentsGuideEmails];

export type { FormEmails } from "./layout.ts";
