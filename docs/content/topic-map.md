# Topic map (MVP release)

Read this before you write a page plan. It says which page owns each topic, where each old page's content goes, and which topics still need an owner. Project facts and MVP rules: `docs/agents/pages.md`. Page list: the 37 MVP rows (Launch = "MVP").

## Rules

- **The owner page holds the full detail.** Every other page says it in one or two lines and links to the owner.
- **Only MVP pages own topics.** An MVP page never links to a later page. The later release is listed at the end of this file.
- **Seasonal facts are shared data.** Dates, ages, prices, deadlines and event dates are Sanity fields. Any page can show the value (for example "July 11–17, 2027"). Only the owner page explains the rule behind it.
- **Messages that may repeat on purpose:** the short line "a nonprofit camp where every kid has type 1, with medical care day and night, and donors pay most of the cost", and the Register, Ask about camp and Donate buttons. Keep them to one line. Never show $3,700 in short messages.
- **No lead magnets in the MVP.** Where the site map says "Find your price", link to `/dates-and-prices`. Where it says "talk to a camp parent", use Ask about camp or the office phone.
- **Later pages** (the 7 pages moved out of the MVP, plus `/win`, `/win/rules`, `/about/store`, `/about/alumni`, `/volunteer/office-and-board`): no MVP page holds their content or links to them. A plan may name the later improvement in one line under "Later".
- **"Remove" pages** end at launch. Keep nothing from them. They get redirects to the closest new page.
- **Top level for now:** `/donate` and `/volunteer` have a later parent (`/get-involved`), so they sit at the top level in the MVP.
- **Conflicts:** do not copy conflicting facts. Use the suggested value in the conflicts table, mark it "(Setebaid to confirm)", and list it under "Open questions" in the plan.
- **Old page status:** (U) means the old page was not live (unpublished). Its text may be old or a draft.

## 1. Topic ownership

### Camps and programs

| Topic | Owner page (full detail lives here) | Pages that only summarize it (1–2 lines + link) | Notes |
| --- | --- | --- | --- |
| Which program fits my child: the comparison of all programs (who, ages, dates, place, price line) | `/camps` | `/`, `/parents`, `/register`, `/dates-and-prices` | One table. Camp pages do not repeat the full table. |
| Age rules and who can attend (ages per camp, the "13 by June 1" rule, the 7-year-old rule, every camper has diabetes) | `/camps` | Each camp page (its own range and its own rule only), `/dates-and-prices` (age column), `/register`, `/parents/faqs` | Ages conflict on the old site. See C1, C2. |
| Harrisburg Diabetic Youth Camp (HDYC): younger campers, what they learn (check blood sugar, give insulin, record results), why kids love it | `/camps/harrisburg-diabetic-youth-camp` | `/camps`, `/`, `/parents` | |
| Camp Setebaid at Mount Luther: teens, independence, teen program | `/camps/camp-setebaid` | `/camps`, `/`, `/parents` | |
| Teen electives | `/camps/camp-setebaid` | — | Only if they still run (Setebaid to confirm). Source: the 2017 electives post. |
| Activities (one full list for both camps) | `/camps` | Each camp page (4–6 highlights for its age, with photos), `/parents` | Both camps use the same site in the same week. Old lists disagree (C17). |
| A typical day, hour by hour | `/parents` (section "A day at camp") | Each camp page (2 lines on its age: younger campers go to bed earlier; teens sleep later and have evening activities), `/parents/medical-care` (check times only) | The old schedule is the 8–12 schedule. One copy only. |
| Learning without classes ("caught, not taught", teachable moments) | `/about` (the approach) | Camp pages, `/parents`, `/` | |
| Counselor-in-Training (CIT): requirements, CIT I and II, housing, evaluation, how to apply, deadline | `/camps/counselor-in-training` | `/camps`, `/camps/camp-setebaid`, `/volunteer` (path to staff), `/dates-and-prices` (dates line) | CIT facts conflict (C11). |
| Diabetes Family Conference: date, program, kids' and teens' activities, registration | `/camps/family-conference` | `/camps`, `/`, `/dates-and-prices` (date and price when set), `/go/{channel}` (doctor and nurse pages, one line) | Next date TBA (C12). |
| Family Camp: a first taste of camp for the whole family | `/camps/family-camp` | `/camps`, `/parents` | No old text. Does it still run? (Setebaid to confirm.) Is it the same as the Family Conference? (C12) |

### Medical care and safety

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| The medical team (pediatric endocrinologist as medical director, doctors, nurses, residents, dietitians; a medical team member is always present) | `/parents/medical-care` | `/`, `/parents`, camp pages, `/camps`, `/go/{channel}` | Faces of the team live on `/about/team`. Medical care may show 2–3 faces and link. |
| Night care (midnight and 3 AM checks, CGMs watched overnight) | `/parents/medical-care` | `/parents`, `/`, `/parents/faqs`, `/go/{channel}` | Dexcom-only wording is old (C9). |
| Daily diabetes routine (checks before meals, meetings with the medical and dietary team, the camper's record, a copy of the blood sugar log at pick-up) | `/parents/medical-care` | `/parents` (the times in the day schedule) | |
| Pumps, CGMs, insulin, how lows and highs are handled | `/parents/medical-care` | `/parents/before-camp` (supplies to pack) | Old text is thin on lows and ketones. See gaps. |
| Food, carbs, dietitians, sample menu | `/parents/medical-care` | `/parents/faqs`, `/parents/before-camp` (no food from home) | The sample menu was never written (old page "Coming soon"). |
| Counselor ratios and cabin supervision | `/parents/medical-care` | Each camp page (its own ratio) | Ratios come from old talking points (C7). |
| American Camp Association (ACA) accreditation | `/parents/medical-care` | `/about/locations` (the site), `/camps`, `/about` | C8. |
| Staff screening (three clearances, FBI fingerprint check) | `/parents/medical-care` (the parent view) | `/volunteer/apply` (the applicant steps), `/volunteer/training` | |
| Hospitals and universities the medical team comes from | `/parents/medical-care` | `/about` (one line) | Three old lists differ (C13). |
| Training future health professionals at camp (residents and students, morning teaching sessions, Dr. David Langdon's idea) | `/about` (mission, part 2) | `/donate` (the Medical Staff Training Fund as a fund choice, one line), `/volunteer/positions` (the trainee roles) | Old source: `/donors/medical-staff-training-at-camp`. |
| Research on reduced diabetes-related stress | `/donate` | `/parents`, `/about` | Only when Setebaid sends the study. |

### Prices and financial help

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| The long price message: what the week includes, what it is worth ($3,700), nonprofit and donors, then Tiers I–IV, honor system, confidential tiers, same camp for all | `/dates-and-prices` | Short message without $3,700 on `/`, `/parents`, `/camps`, camp pages, `/go/{channel}` | `/donate` uses $3,700 from the donor side only. |
| Camperships for families (Tier IV, Sliding-Scale Fee Program, Financial Assistance Program, processing fee, first come first served, how to apply, why families apply) | `/dates-and-prices/financial-help` | `/dates-and-prices`, `/parents/faqs`, `/donate/camperships` (one line: donors fund this) | Old talking points have an old fee (C5). |
| Other ways for a family to pay for camp (civic groups, sample letter, family fundraising ideas) | `/dates-and-prices/financial-help` | — | |
| Fees for CIT, Family Conference, Family Camp | `/dates-and-prices` (when set) | Each program page (the value only) | |
| $200 deposit, $50 late fee after May 15, refund deadline, written cancellation | `/refund-policy` | `/dates-and-prices` (one line each), `/register`, `/parents/faqs` | The old PDF text is not in the repo (C19). |
| Donation refunds | `/refund-policy` | `/donate` | New rule (Setebaid to confirm). |

### Registration and the interest form

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| How to register in Camp Brain (steps with screenshots, account help for returning families, the "You're in" confirmation and next steps) | `/register` | Every parent page (Register button), `/parents/before-camp` (starts after registration) | |
| Early-bird date, limited places (75), waitlist with deposit | `/register` | `/` (season line), `/dates-and-prices`, `/camps` | No live "spots left" count. |
| Registration open / season status line | `/register` | `/` (one-line season line set in Sanity) | |
| "How did you hear about us?" (asked in Camp Brain) | `/register` | — | |
| "I'm interested" form, the fast call and the four emails | `/ask-about-camp` | `/contact` (uses the same form), `/`, `/parents`, `/camps`, `/go/{channel}` | One form. Contact shows it but does not explain the follow-up. In the MVP this form also stands in for "talk to a camp parent". |

### Before camp

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| Forms and health requirements (medical forms, CDC vaccinations up to date) | `/parents/before-camp` | `/register` (vaccinations before you pay the deposit), `/parents/faqs` | The forms list is new content. |
| Packing list (one list for both camps), what not to bring, diabetes supplies to send | `/parents/before-camp` | `/parents/medical-care` (one line on supplies), `/parents/faqs` | Supplies conflict (C4). |
| Drop-off and pick-up | `/parents/before-camp` | `/parents/faqs`, `/about/locations` | Not on the old site. See gaps. |
| Places to stay and travel from far away (including other countries) | `/parents/before-camp` | `/about/locations` | |
| Camper mail (Bunk Notes) and contact during camp | `/parents/before-camp` | `/parents/faqs`, `/contact` (one line: camper mail goes to camp only during camp) | Bunk1 facts may be old (C16). |
| In-session photo gallery for parents (Bunk1) | `/parents/before-camp` | `/stories` (public photos are separate), `/privacy-policy` (photo handling) | |
| Parent manual (download) | `/parents/before-camp` | — | The intern writes it. Link only if ready at launch. |

### Parents' worries and questions

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| Is my child safe, will they fit in, homesickness, what do I do next | `/parents` | `/`, `/parents/faqs` | Homesickness is new content. See gaps. |
| Parent FAQs | `/parents/faqs` | — | FAQs own only questions that no other page owns. For an owned topic, the answer is 1–2 lines and links to the owner. |

### Channel landing pages

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| One short page per QR code or link (events, doctors, nurses, each volunteer), so each visit is counted | `/go/{channel}` | — | Each page summarizes owned topics and links to them. It owns no topic. Doctor and nurse pages give the medical facts in one minute, from `/parents/medical-care`. |

### People and volunteers

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| Team members with photos and short notes | `/about/team` | `/parents`, camp pages, `/parents/medical-care` (2–3 medical faces) | Real names and photos only. MVP: the people Setebaid can supply now, not a full roster. |
| Mark's welcome message | `/about/team` | `/about` (one quote line) | History facts from his letter move to `/about`. |
| Mark's video | `/` | `/parents` (same video, no new text) | Only if the video is ready. Otherwise the old video stays until it is. |
| Who runs camp: volunteer camp staff, small year-round office | `/about/team` | `/volunteer`, `/donate`, `/about` | |
| Camp roles and duties (camp director to counselor, medical and dietary roles, job PDFs) | `/volunteer/positions` | `/about/team` (role names as group headings only), `/volunteer` | |
| Why volunteer, what the week is like, time needed, benefits, male staff stories | `/volunteer` | `/camps/counselor-in-training`, `/stories` | |
| How to apply (interest form, staff review, registration link, clearances, returning staff priority until 1 February, email is the main channel) | `/volunteer/apply` | `/volunteer`, `/volunteer/positions` | |
| Pre-camp staff training (child development, teaching by age, diabetes skills, treating lows) | `/volunteer/training` | `/parents/medical-care`, `/volunteer`, `/parents` | |
| Office and board help | `/about/board` (one line: committees need help, contact the office) | `/volunteer` (one line) | Full page is later (`/volunteer/office-and-board`). |

### Donors and campaigns

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| How to give: once or monthly in Camp Brain as a guest, choose a fund, check by mail, tax-deductible, receipt, state registration line | `/donate` | Every page (Donate button), campaign pages (button) | Funds to confirm: general, campership, memorial, medical staff training. |
| Why give: what T1D asks of a family, "each camper costs $3,700, donors pay the difference", what a gift buys, why it works | `/donate` | `/donate/camperships`, `/about`, `/stories` | Impact graphs are later. Use the facts on hand. |
| Fund a campership (the donor side) | `/donate/camperships` | `/donate`, `/dates-and-prices/financial-help` (one line) | |
| Memorial and honor gifts (card mailed, amount not shown) | `/donate/memorial` | `/donate` | The Microsoft form becomes a site form. |
| All current campaigns and events, including how to help at an event | `/donate/campaigns` | `/`, `/donate`, `/stories` (event recaps) | |
| One campaign or event: story, date, place, cost, sponsor form, progress bar, Camp Brain button | `/donate/campaigns/{campaign}` | `/donate/campaigns` (card) | Instances: annual appeal, Setebaid Walk, golf, Type 1-derful 5K, cornhole, dueling pianos, Family Day, Dahlias for Diabetes, giving days. Which run in 2027? (Setebaid to confirm.) |
| Giving days (GivingTuesday, Raise the Region, Centre Gives, ExtraGive) | `/donate/campaigns/{campaign}` (one instance per day, only when it runs) | `/donate/campaigns` | |
| Event sponsors | `/donate/campaigns/{campaign}` (each event's sponsor form) | `/donate/campaigns` (one line) | A general sponsor offer is later. |

### Stories, about and contact

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| One story (camper, parent, staff, donor) | `/stories/{story}` | `/parents`, `/donate`, `/volunteer` (a quote of 1–2 lines + link) | A full story lives on one story page only. |
| Story index, news, public photo gallery | `/stories` | `/` (latest 3), camp pages (photos) | Replaces the old news section. |
| Alumni | — (later page) | `/volunteer` (alumni can volunteer, one line), `/stories` (alumni stories) | No MVP owner. Do not link to `/about/alumni`. |
| Who Setebaid is: name story, founding years, founders, mission (3 parts), approach, goals, inclusion statement, safety commitment | `/about` | `/`, `/about/team`, `/donate` (one line) | Use founding years, not "over N years" (C3). |
| Past camp sites | `/about` (one line in history) | — | |
| Board, governance, 501(c)(3) status, state charity registration and financial information | `/about/board` | `/about`, `/donate` (registration line), `/dates-and-prices/financial-help` (one link) | |
| Camp location: Camp Mount Luther address, drive times, map, virtual tour, visiting camp | `/about/locations` | Camp pages, `/camps`, `/contact`, `/parents/before-camp` | |
| Office contact: addresses, phone, email, fax, directions to the office, "the office is not at camp" | `/contact` | Footer, `/donate` (mailing address for checks), `/ask-about-camp` | |

### Legal

| Topic | Owner page | Pages that only summarize it | Notes |
| --- | --- | --- | --- |
| Privacy: data from forms and Camp Brain links, how it is used, deletion requests, how camper photos are used | `/privacy-policy` | Every form (one line + link), footer, `/cookie-policy` | |
| Cookies and tracking tools (analytics, embedded video, Camp Brain links), why, how to turn them off | `/cookie-policy` | `/privacy-policy` (one line + link), footer | |
| Terms of use, no medical advice | `/terms-of-use` | `/parents/medical-care` (one line: your child's doctor decides), footer | |
| Accessibility statement | `/accessibility` | Footer | |

## 2. Old page destinations

Old paths. (U) = not live on the old site.

### Home, camps and campers

| Old page | Destination | Keep | Drop or retire |
| --- | --- | --- | --- |
| `/home` | `/` | The welcome: nonprofit, camps for kids with diabetes; "they don't realize they are learning"; independence and new friends. | "Request Info" becomes Ask about camp. Network for Good donate menu. The old video, once Mark's video is ready. |
| `/campers` | `/camps` | Activity examples. | "Over 42 years" (C3). The vaccination note moves to `/parents/before-camp`. |
| `/campers/general-camp` (U) | `/camps` | The "which camp should I choose" idea, the activity list, the 7-year-old rule. | 2025 dates and ages "7–12" and "13–14" (C1, C2). |
| `/campers/camp-setebaid` | `/camps/camp-setebaid` | "Diabetes is the norm", independence, self-management under medical care, "no classes", map. Drive times move to `/about/locations`. | Ages "7*–14" (C1). "Over 42 years". The activity list moves to `/camps`. |
| `/campers/camp-setebaid/activity-list` (U) | `/camps` | The side-by-side activity table. | Rows that conflict with other lists until confirmed (C17). |
| `/campers/camp-setebaid/typical-day` (U) | `/parents` | Nothing new: same schedule as `/a-typical-day-at-camp`. | The duplicate. |
| `/a-typical-day-at-camp` | `/parents` (section "A day at camp") | The hour-by-hour day; younger campers go to bed earlier; teens sleep later. Camp pages keep the 2-line age note. | — |
| `/campers/camp-setebaid/camper-health-safety` (U) | `/parents/medical-care` | Same text as the HDYC health page. | The duplicate. |
| `/campers/camp-setebaid/what-to-bring-to-camp` | `/parents/before-camp` | The packing list, what not to bring, supplies to send. | The duplicate copy for HDYC. |
| `/campers/camp-setebaid/camp-volunteers` (U) | `/volunteer` | Nothing (empty). | Empty page. |
| `/campers/harrisburg-diabetic-youth-camp` | `/camps/harrisburg-diabetic-youth-camp` | The HDYC intro, what campers learn (check, give insulin, record), "caught, not taught", the 7-year-old rule, map. | The activity list moves to `/camps`. |
| `/campers/harrisburg-diabetic-youth-camp/camper-programs` | `/camps` | Same activity table as above. | The duplicate. |
| `/campers/harrisburg-diabetic-youth-camp/typical-day` | `/parents` | Same schedule. | The duplicate. |
| `/campers/harrisburg-diabetic-youth-camp/health-safety` | `/parents/medical-care` | Medical team, medical director, partner list, night checks, CGM overnight, records at pick-up, ACA accreditation, three clearances, staff training (one line + link to `/volunteer/training`), staff who have T1D. | The second "American Camping Association" sentence and the claim about state inspections (C8). |
| `/campers/harrisburg-diabetic-youth-camp/what-to-bring-to-camp` | `/parents/before-camp` | Same list as Camp Setebaid. | The duplicate. |
| `/campers/harrisburg-diabetic-youth-camp/camp-volunteers` (U) | `/volunteer` | Nothing (empty). | Empty page. |
| `/campers/family-camp` (U) | `/camps/family-camp` | Nothing (empty). Needs facts from Setebaid. | — |
| `/campers/diabetes-family-conference` | `/camps/family-conference` | Full day for the family, sessions for parents, children 3–12 and teens 13–18 activities, siblings welcome, contact the office. | "Coming soon" brochure lines. Camp Swatara as the place until confirmed (C12). |
| `/news/news/diabetes-family-conference` (U) | `/camps/family-conference` | Nothing (the 2016 date). | Retire. |
| `/campers/counselor-in-training-program` | `/camps/counselor-in-training` | Requirements, program content, CIT I and II, housing, evaluation, diabetes management, skills, progression, how to apply. | 2025 deadline and 2025 PDF (C11). |
| `/campers/register-now` | `/register` | 2027 schedule line, the Camp Brain link. | "Family Conference TBA" moves to `/camps/family-conference`. |
| `/campers/request-info`, `/parents/request-info` (U), `/contact-us/request-info` | `/ask-about-camp` | The idea of a request form. | The Wufoo form. |
| `/campers/dates-rates` | `/dates-and-prices` | 2027 dates and ages, the tier table, honor system, confidential tiers, same camp for all, Tier IV intro. Deposit, late fee and refund text move to `/refund-policy` (one line each stays). | "Camperhsip" typo. "Click here" links. Ages per C1, C2. |
| `/parents/dates-rates` (U) | `/dates-and-prices` | Nothing (empty). | Empty page. |
| Payment and refund policy PDF (linked from `/campers/dates-rates`) | `/refund-policy` | All rules, as a web page. | The PDF. Text is not in the repo (C19). |
| `/campers/financial-assistance-setebaid-campership-fund`, `/campers/campership-fund` | `/dates-and-prices/financial-help` | The two programs, first come first served, apply early, why families apply, other ways to pay (civic groups, sample letter, fundraising ideas, thank-you notes). The state charity registration link moves to `/about/board`. | The donor thank-you and donate link (move to `/donate/camperships`). "$1,350" and the old talking points (C5, C7). The two copies are the same text. |

### Parents

| Old page | Destination | Keep | Drop or retire |
| --- | --- | --- | --- |
| `/parents` (U) | `/parents` | "Campers who just happen to have diabetes", safe with expert health providers, the alumni quote. | "Over 43 years" (C3). |
| `/parents/parent-manual` (U) | `/parents/before-camp` | Nothing ("Coming soon"). | — |
| `/parents/places-to-stay` (U) | `/parents/before-camp` | Nothing ("Coming soon"). | — |
| `/parents/international-campers` (U) | `/parents/before-camp` (travel); city list to `/about/locations` | Cities within a few hours' drive; campers from other countries; parents can take a holiday nearby. | — |
| `/parents/camper-email-photo-gallery` (U) | `/parents/before-camp` | Bunk Notes, the parent-controlled photo gallery, bundle price, Bunk1 contact. Photo handling: one line in `/privacy-policy`. | Prices until confirmed (C16). |
| `/parents/faqs` (U), `/about/faqs` (U) | `/parents/faqs` | Nothing ("Coming soon"). | — |
| `/about/food-sample-menu` (U) | `/parents/medical-care` | Nothing ("Coming soon"). | — |

### About and contact

| Old page | Destination | Keep | Drop or retire |
| --- | --- | --- | --- |
| `/about` | `/about` | Partnerships with health providers and diabetes educators, education is the key, the prevention model, training future health professionals and the trainee list (C13). | — |
| `/about/our-story` (U) | `/about` | Nothing (empty). | — |
| `/about/history-goals` | `/about` | Approach, inclusion philosophy, safety commitment, name story, 1977 and 1998, mission (3 points), "caught not taught", training future health professionals, camp goals. | "Over 40 years", "leaders in the diabetes camping industry" (C3). |
| `/about/message-from-our-director` | `/about/team` (the letter); `/about` (history facts) | Mark's welcome, team approach, volunteer team, community and family. The founding story (1978, endocrinologist, dietitian, teacher) moves to `/about`. | Repeated history lines in the letter. |
| `/about/camp-leadership` | `/about/team` (intro); role duties to `/volunteer/positions` | The intro: every role is essential to a safe, fun week. | Role descriptions here (owned by `/volunteer/positions`). |
| `/volunteer-camp-staff/meet-our-staff` (U) | `/about/team` | The question set for staff profiles (name at camp, role, years, favorite activity, years with diabetes, hometown, job, fun fact). | The unfinished entry. |
| `/about/organization-governance` (U) | `/about/board` | Nothing ("Coming soon"). Needs facts from Setebaid. | — |
| `/about/locations` (U) | `/about/locations` | Camp Mount Luther address, Union County, ACA-accredited site. | — |
| `/about/virtual-tours` (U) | `/about/locations` | Nothing ("Coming soon"). | — |
| `/interactive-map` | `/about/locations` | Nothing ("under construction"). | — |
| `/about/camp-store` (U) | `/about/store` (later) | Nothing (empty). | — |
| `/contact-us` | `/contact` | Office email, phone, fax, mailing and physical address, "office is not at camp", camp address for GPS (link to `/about/locations`), "camper mail only during camp" (link to `/parents/before-camp`), reply next business day. | — |
| `/contact-us/address` (U) | `/contact` | Directions: Route 15 between Lewisburg and Selinsgrove. | Duplicate address lines. |
| `/contact-us/driving-directions` (U) | `/contact` | Nothing ("Coming soon"). | — |

### Donors and events

| Old page | Destination | Keep | Drop or retire |
| --- | --- | --- | --- |
| `/donors` (U) | `/donate` | Short, plain explanation of what T1D asks of a family. | The long medical explanation. Network for Good line. |
| `/donors/general-donation` | `/donate` | Tax-deductible, check by mail address, questions contact, state registration line. | Network for Good link and line. |
| `/donors/why-donate` | `/donate` | Reduced diabetes-related stress (only with the study), the "village" idea, training future health providers (one line, link to `/about`). | "Over 35 years" (C3). The CDC "1 in 3 by 2050" figure is about all diabetes types (Setebaid to confirm it is wanted). "A famous politician" wording. |
| `/donors/donors` (U) | — (retire) | Nothing. | The 2017 donor list. |
| `/donors/camperships` | `/donate/camperships` | Gift of camp to a child with T1D, mail-a-check option, questions contact, thank-you. | Network for Good links. |
| `/donors/memorial-donation` | `/donate/memorial` | Living memorial, personalized card mailed, gift amount not shown, card sent next business day, mail option with form. | Microsoft form (becomes a site form), 2016 PDF form name, Network for Good steps. |
| `/donors/medical-staff-training-at-camp` | `/about` (the program); `/donate` (the fund, one line) | Dr. David Langdon's training idea, who trains (residents, NP and medical students), morning teaching sessions, the program costs Setebaid money. | Network for Good link. |
| `/donors/annual-appeal` (U) | `/donate/campaigns/{campaign}` (annual appeal instance) | What camp gives a child, what a gift does. | 2020 campaign link. Partner list (owned by `/parents/medical-care`). |
| `/donors/golf-tournament` (U) | Campaign instance: golf | Format, what the fee includes, prize types, sponsor form idea. | 2020 date, place, prices. "Serves over 250 children annually" (C14). |
| `/donors/setebaid-walk` (U) | Campaign instance: Setebaid Walk | The walk at Knoebels before Family Day, teams. | Old date. setebaidwalk.org until confirmed (C18). |
| `/donors/type-1-derful-5k` (U) | Campaign instance: Type 1-derful 5K | Place (Bucknell), timed and untimed options, age-class medals, sponsor forms. | 2021 dates, links, release PDF. |
| `/events` | `/donate/campaigns` (list); instances: Dahlias for Diabetes, Dueling Pianos | Dahlias story (Lilly and LeeAnn Huber), Dueling Pianos details. | 2026 dates once past. |
| `/events/cornhole-tournament` (U), `/events/dueling-pianos` (U) | Campaign instances | Nothing (empty). Use the 2024 post for format only. | — |
| `/events/setebaid-family-day` (U) | Campaign instance: Family Day | Reunion idea, camp songs and games, meal with carb counts, raffles for the Campership Fund, one adult per family. | 2021 dates, prices, T-shirt offer. |
| `/volunteer-camp-staff/fundraising-events` (U) | `/donate/campaigns` | Nothing (empty). Helping at events is one line on `/donate/campaigns`. | — |

### Volunteers and alumni

| Old page | Destination | Keep | Drop or retire |
| --- | --- | --- | --- |
| `/volunteer-camp-staff` | `/volunteer` | Volunteers make camp possible; what you give (supervision, expertise, role model); what you gain (skills list, connections, work with professionals). | — |
| `/volunteer-camp-staff/about-staff` (U) | `/volunteer` | Why staff camp: team of professionals, learn about diabetes, references for school and work, friendships, fun. Parent reassurance lines go to `/parents/medical-care` (one line). | "Teen weekends" until confirmed (C15). The paper interest form. |
| `/volunteer-camp-staff/available-positions` | `/volunteer/positions` | Every role and its duties, job PDFs, licensure rules, residents ask 6 months ahead, PA students need a partner program. The "almost all volunteers" intro goes to `/about/team`. | — |
| `/volunteer-camp-staff/staff-interest-form` | `/volunteer/apply` | The interest form fields (Wufoo becomes a site form). | Wufoo embed. |
| `/volunteer-camp-staff/staff-application` (U) | `/volunteer/apply` | New staff: form first, then account and clearances. Returning staff: form and login. Help contact (volunteer@ email). | — |
| `/volunteer-camp-staff/staff-training` (U) | `/volunteer/training` | Nothing (empty). Use the training list from the health pages. | — |
| `/volunteer-camp-staff/office-support` (U), `/volunteer-camp-staff/board-committees` (U) | `/volunteer/office-and-board` (later); MVP: one line on `/about/board` | Nothing (empty). | — |
| `/news/news/counselors-wanted` (U) | `/volunteer/positions` | Nothing beyond the form link. | Retire the post. |
| `/news/news/looking-for-a-fantastic-opportunity-in-diabetes-camping` (U) | `/volunteer/positions` | Nothing. | The 2016 AmeriCorps job. |
| `/alumni`, `/alumni/alumni-info` | `/about/alumni` (later); MVP: one line on `/volunteer`, past sites one line on `/about` | Past camp sites list, alumni return as counselors, update form. | Twitter link. |
| `/alumni/photo-gallery` | `/stories` (MVP row); albums later on `/about/alumni` | The idea of a gallery by year. | — |

### Stories and news

| Old page | Destination | Keep | Drop or retire |
| --- | --- | --- | --- |
| `/news`, `/news/news` | `/stories` | Nothing beyond "news and events". | — |
| `/photo-gallery` | `/stories` (photo gallery) | The idea of albums per camp. | 2015 Flickr albums (unless Setebaid wants an archive). |
| `/news/news/dear-setebaid` (U) | `/stories/{story}` (parent story) | Rosemarie's letter about Frankie: "feeling normal and like I belonged again". | Needs the family's permission to republish (Setebaid to confirm). |
| `/news/news/your-pump-is-pink-mine-is-purple` (U) | `/stories/{story}` (parent and counselor story) | Beth Shuff's week at camp, "Mine is purple! Yours is pink!", "consider diabetes camp as part of your village". | Permission (Setebaid to confirm). |
| `/news/news/the-future-diabetes-camp-showed-me` (U) | `/stories/{story}` (camper to counselor) | Liz's story. The post is only a link to an outside magazine. | Ask Liz for the text, or link to the article. |
| `/news/news/a-peek-into-the-future` (U) | `/stories/{story}` (staff voice), optional | Liz as program director: Gaga, Color Wars, the watermelon race. | 2016–2017 season details. |
| `/news/news/camp-setebaid-electives` (U) | `/camps/camp-setebaid` | The electives idea, if they still run. | 2017 Swatara details and the $35 fee. |
| `/news/news/open-house`, `/news/news/open-house-at-camp-swatara` (U) | `/about/locations` | The idea of an open house (visit camp, tours, questions). | 2017 dates; Camp Swatara. |
| `/news/news/setebaid-walk` (U) | Campaign instance: Setebaid Walk | Nothing current. | 2016 total. |
| `/news/news/golf-tournament` (U) | Campaign instance: golf | Nothing current. | 2018 details and contact. |
| `/news/news/type-1-derful-5k-kids-fun-run` (U) | Campaign instance: 5K | The family and children's walk/run. | 2019 details. |
| `/news/news/setebaid-family-day-at-knoebels` (U) | Campaign instance: Family Day | Nothing new. | 2017 details. |
| `/news/news/events-planned-for-novembers-diabetes-awareness-month` (U) | Campaign instances: cornhole, dueling pianos | Event formats only. | 2024 dates and prices. |
| `/news/news/extragive` (U) | `/donate` (gift examples); giving-day instance | "$50 = breakfast for a week, $75 = lunch for a week, $150 = a week of lodging" (Setebaid to confirm current values). | 2023 date. |
| `/news/news/camp-setebaid-needs-your-help` (U) | Giving-day instance (Centre Gives) | Nothing current. | "Over 150 children in 2022" (C14). |
| `/news/news/centre-gives`, `/news/news/raise-the-region`, `/news/news/givingtuesday` (U) | Giving-day instances | The giving-day names only. | Dates and old links. |
| `/news/news/support-camp-setebaid-during-the-hundredx-give-without-spending-fundraiser` (U) | — (retire) | Nothing. | 2023 offer. If it still runs, it becomes a campaign instance. |
| `/news/news/t1d-camp-open-house-at-camp-mount-luther` (U) | — (retire) | Nothing (it is a 2017 Boscov's shopping day). | — |
| `/news/news/camp-registration-is-open` (U) | `/register` | "Returning families: call the office if you cannot open your camper profile." | 2017 link. |
| `/news/news/national-diabetes-awareness-month` (U) | — (retire) | Nothing. | 2016 cover photos. |
| `/news/news/spring-camp-newsletter`, `/news/news/winter-newsletter` (U) | — (retire) | Newsletter sign-up idea (see gaps). | 2016 PDFs. |
| `/news/news/setebaid-campetition` (U) | — (retire) | Nothing. | Points to Campetition (Remove row). |

### Remove row (ends at launch)

| Old page | Destination | Keep | Drop or retire |
| --- | --- | --- | --- |
| `/campers/2021-spring-virtual-camps` (U), `/campers/virtual-camps` (U), `/donors/virtual-camp-support-for-2020` (U) | Redirect to `/camps` (camper pages) or `/donate` (donor page) | Nothing. | Pandemic programs. Julie's 2020 story ends with them. |
| `/campers/campetition` (U) | Redirect to `/camps` | Nothing. | 2021 Swatara COVID camp. |
| `/news/news/create-camp-smiles-with-amazonsmile` (U), `/news/news/support-setebaid-services-by-participating-in-igive.com` (U) | Redirect to `/donate` | Nothing. | Ended programs. |
| `/news/news/2020-summer-camps`, `/news/news/2023-camp-registration-is-open`, `/news/news/well-see-you-at-camp-in-2016` (U) | Redirect to `/stories` or `/register` | Nothing. | Dated posts. |

## Content conflicts to resolve

Do not copy these. Use the suggested value and mark it "(Setebaid to confirm)".

| Code | Conflict | Suggested value until confirmed |
| --- | --- | --- |
| C1 | Camp Setebaid ages: "7*–14" and "13–17" on one page; "13–14" (2025); "7–14" (2023 post). | 13–17 (2027 Dates & Rates). |
| C2 | HDYC ages: "7–13" vs "7–12". Turning 13 by June 1: "should go to Camp Setebaid" vs "may attend either camp". 7-year-olds must check their own blood sugar and have a doctor confirm. | 7–13, and ask which June 1 rule applies. |
| C3 | Years: "over 35", "over 40", "over 42", "over 43". Programs began 1977; Camp Setebaid began 1978 (director letter); HDYC founded 1978; incorporated 1998. | Use the years, never "over N years". Confirm what began in 1977. |
| C4 | "All diabetes medical supplies are provided" vs "we cannot provide pump supplies" and "no CGM supplies at camp". | Families send pump and CGM supplies. Ask what camp provides (insulin? test strips?). |
| C5 | Talking points say "Camp fees are $1,350". 2027 tiers are $3,700 / $1,300 / $1,050 / $50 + campership. | 2027 tier table. Ask how "$50 + campership" works. |
| C6 | "Every child may receive a partial scholarship" and "no child is turned away because of cost". | Do not use either line until Setebaid confirms. |
| C7 | "Each cabin is assigned a doctor"; 1 counselor to 3 campers under 13, 1 to 5 over 13. | Use only after Setebaid confirms. |
| C8 | "American Camp Association" vs "American Camping Association". Are the Setebaid camps themselves accredited, or the site? The claim about state camp inspections. | "Accredited by the American Camp Association" after confirmation. Drop the state inspection claim unless Setebaid wants it. |
| C9 | Overnight CGM care names Dexcom only. | "CGMs" in general, after confirmation. |
| C10 | "24/7 on-site medical staff" vs "a medical team member is always present". | "Medical staff on site day and night" after confirmation. |
| C11 | CIT ages "16, not yet 18" vs "16 and 17"; "two-week program" vs CIT I and CIT II as separate weeks; CIT II "at HDYC, part of Camp Setebaid at Mount Luther"; deadline February 14, 2025. | Ask for the 2027 rules, deadline and packet. |
| C12 | Family Conference at Camp Swatara; teens 13–18; next date TBA. Family Camp has no text. Are they one program or two? | Ask. |
| C13 | Three different partner lists ("past partners included…"); the trainee list on `/about` is longer than the medical team list. | One current medical team list on `/parents/medical-care`; the trainee list on `/about`. |
| C14 | Camper counts: "over 250 a year" (2020), "over 150 in 2022", about 50 in 2026. | Publish no count unless Setebaid gives one. |
| C15 | "Teen weekends" in the old staff text. | Leave out unless they run. |
| C16 | Bunk1 prices ($15, $15, $25 bundle), facial recognition, daily posting by 10 PM. The page was not live. | Ask whether Bunk1 is still used. |
| C17 | Activity lists differ (mini-golf, high ropes, zip line, four-square, fishing, disc golf). | One confirmed list for Camp Mount Luther. |
| C18 | Setebaid Walk on setebaidwalk.org; Family Day registration in Camp Brain or on the walk site. | Camp Brain links only, after confirmation. |
| C19 | The refund policy PDF text is not in the repo. Donation refund rule unknown. | Ask for the current PDF. |
| C20 | Director letter: "our entire team is made up of volunteers". Positions page: a few paid office staff. | "Camp staff are volunteers; a small office team works all year." |

## 3. Gaps

Topics a reader needs that no old page covers. Each gets an owner from the 37 MVP pages. MVP plans use the content that exists today: the owner plan lists the gap under "Open questions". If the facts do not arrive in time, it names the gap in one line under "Later".

| Topic | Reader (avatar) | Suggested owner | What is needed |
| --- | --- | --- | --- |
| Drop-off and pick-up: day, times, check-in steps, meeting the medical team | Worried Wendy | `/parents/before-camp` | Setebaid supplies the process. |
| Medical forms: which forms, who signs, deadlines (incl. the doctor's note for 7-year-olds) | Worried Wendy, Busy Beth | `/parents/before-camp` | Forms list from Setebaid. |
| How lows, highs, ketones and sick days are handled; when the parent gets a call | Worried Wendy, Busy Beth | `/parents/medical-care` | The medical team writes or checks it. |
| Pumps and CGMs: which systems, who changes sites, phones for CGM apps, can parents follow readings | Worried Wendy | `/parents/medical-care` | All surveyed families use a pump and a CGM. |
| Homesickness and fitting in; first-time campers | Worried Wendy | `/parents` | A parent story helps here. |
| Phones and contact during camp; how parents get news | Worried Wendy | `/parents/before-camp` | Setebaid's rule. |
| Cabins, sleeping, cabin-mate requests | Worried Wendy | `/parents/faqs` | Setebaid's rule. |
| Food allergies, celiac and special diets; sample menu | Worried Wendy | `/parents/medical-care` | Menu from the dietitian. |
| "Is my child registered? What happens next?" | Worried Wendy, returning families | `/register` | The Camp Brain confirmation steps. |
| Re-registration for returning families ("save your spot") | Returning families | `/register` | E2 timing. |
| Visiting camp before the season (open house or tour) | Worried Wendy | `/about/locations` | Does Setebaid run one? |
| Office hours and the best time to call | Everyone | `/contact` | Hours. |
| How camper photos are used on the site and social media; consent | Worried Wendy | `/privacy-policy` | Setebaid's photo consent rule. |
| One-minute medical facts for a doctor or nurse who scans a card | Busy Beth | `/go/{channel}` (doctor and nurse pages, summary of `/parents/medical-care`) | Checked by the medical team. |
| Volunteer dates and time needed (arrival, training days, camp week) | Eager Ethan | `/volunteer` (summary), `/volunteer/training` (training dates) | Dates from Setebaid. |
| Counselor requirements: minimum age, T1D welcome, cost to staff (meals, lodging), letters or service hours | Eager Ethan | `/volunteer/positions` (requirements), `/volunteer` (what you get) | Setebaid's rules. |
| How new staff are welcomed (fit in with a team that knows each other) | Eager Ethan | `/volunteer/training` | Staff survey theme. |
| Placements for medical residents and students | Busy Beth, medical volunteers | `/volunteer/positions` | Partner programs to confirm. |
| Receipts, tax ID, and gifts by employer match, stock or will | Generous Greta | `/donate` | Which of these Setebaid accepts. |
| Donor and sponsor thank-you list (current year) | Generous Greta, businesses | `/donate` | Does Setebaid want a public list? |
| Annual report or financial summary | Generous Greta | `/about/board` | Setebaid supplies it. |
| Story email or newsletter sign-up | Generous Greta, alumni, parents | `/stories` | Where sign-ups go. |
| Alumni (until the alumni page) | Alumni (Donors, Volunteers) | `/volunteer` (one line) | No link to the later page. |
| Research on reduced diabetes-related stress | Busy Beth, Generous Greta | `/donate` | The study or its citation. |
| Social media links | Everyone | Site footer (not a page) | Current accounts. |

## Later release

These 7 pages moved out of the MVP. They own no topic now. When they are built, they take over these topics from their MVP owners, and the MVP owners shrink to a summary line.

| Later page | Takes over | From MVP owner |
| --- | --- | --- |
| `/get-involved` | The hub of all ways to help; "help with marketing" (share kits and own QR codes for parents and volunteers, becoming a parent ambassador); run your own fundraiser; a general sponsor offer; office and board help; alumni until `/about/alumni`. Becomes the parent of `/donate` and `/volunteer`. | `/donate/campaigns` (fundraising and sponsors), `/about/board` (office and board line), `/volunteer` (alumni line) |
| `/parents/talk-to-a-parent` | Booking a call with a parent ambassador or the camp nurse. | `/ask-about-camp` (stands in today) |
| `/parents/guide` | "Sending your child with type 1 diabetes to camp", the download for an email address. | — (new content) |
| `/parents/camp-readiness-quiz` | The readiness quiz and its results. | — (new content) |
| `/dates-and-prices/find-your-price` | "Which tier is for me?" price quiz; the QR target on the doctors' card. | `/dates-and-prices` (the tiers stay there) |
| `/refer` | The referral kit for doctors and nurses: the one sentence, cards and parent sheet, card orders, thank-you and recognition, one-page medical facts. | `/go/{channel}` doctor and nurse pages |
| `/donate/impact` | Impact graphs and numbers; the full "why give" case; research on reduced stress; training future health professionals (donor view); donor and sponsor thank-you list. | `/donate` (why give, research, gift examples), `/about` (training program, donor view only) |
