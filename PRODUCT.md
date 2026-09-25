# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js with Sanity (content in Sanity Studio), hosted on Vercel. Confirmed by the user on 2026-09-25. Nothing is scaffolded yet.

## Users

**Primary: parents and guardians of children and teens with diabetes (mostly type 1).** They are deciding whether to send their child to a sleep-away summer camp, often for the first time. Their job: understand which camp fits their child's age, trust that the child is medically safe away from home, see dates and what it costs (including financial help), and register.

Secondary audiences, in this order of priority:

- **Donors and sponsors:** give money (general, memorial, campership fund), or join fundraising events.
- **Staff and volunteers:** counselors, medical staff and volunteers who apply or show interest.
- **Campers, teens and alumni:** see what camp is like, Counselor-in-Training (CIT) path, stay connected.

## Product Purpose

setebaidservices.org is the public website of Setebaid Services®, a Pennsylvania not-for-profit that runs diabetes education and support summer camps for children and teens with diabetes and their families. The site exists to fill the camps, keep camp available to every child with diabetes through donations, and recruit the staff and volunteers who run it.

Success: parents understand the right camp for their child and register without needing to call the office. Donors can give quickly, and staff and volunteers can apply.

This is a rebuild of the old ProcessWire site. The content inventory and sitemap planning live on the Miro board "SetebaidServices.org 2026" (https://miro.com/app/board/uXjVHivCMTQ=/). The converted old content is in `build/pages/` and `build/pages.json`.

## Positioning

- Camps are **exclusively for youth with diabetes**, so "diabetes is the norm, not the exception". Campers are "kids who just happen to have diabetes".
- Diabetes education is built into ordinary camp fun: "the participants don't realize they are learning". Campers go home more independent in managing their own diabetes.
- An expert healthcare team is on site. Setebaid has taken part in research that shows its camps reduce diabetes-related stress.
- **Tiered "honor system" pricing:** Tier I is the true cost, Tiers II–III are subsidized, and Tier IV is income-based campership. All tiers are confidential, and every child gets the same camp. The Campership Fund exists so that camp is available to every child with diabetes.
- Long history: programs began in 1977, the Harrisburg Diabetic Youth Camp was founded in 1978, and Setebaid Services was incorporated in 1998.

## Operating Context

- **Programs (active):**
  - Harrisburg Diabetic Youth Camp (HDYC): ages 7–13, July 11–17, 2027, Mifflinburg, PA.
  - Camp Setebaid at Mount Luther: ages 13–17, July 11–17, 2027, Mifflinburg, PA.
  - Diabetes Family Conference / Family Camp.
  - Counselor-in-Training (CIT) program.
  - Fundraising events: Setebaid Walk, golf tournament, Type 1-derful 5K, Setebaid Family Day, cornhole tournament and similar.
- **Yearly cycle:** registration opens for the next season, and a late fee applies after May 15. Written refund requests must arrive by May 15. Camp runs in July. Dates, rates and fees change every season.
- **Before camp, parents deal with:** a $200 deposit, a vaccination requirement (all CDC-recommended vaccinations up to date), a packing list, health and safety information, a parent manual, and camper mail and photo galleries during the session.
- **Office:** Setebaid Services, Inc., P.O. Box 196, Winfield, PA 17889-0196. Physical location: 1157 Westbranch Highway, Winfield, PA 17889. Phone (570) 524-9090, email info@setebaidservices.org.

## Capabilities and Constraints

- **Stays external (the site links out):** camper registration on CampBrain (setebaid.campbrainregistration.com), and donations on Network for Good (setebaidservices.networkforgood.com).
- **Moves into the new site:** the forms that were on Wufoo (request info, staff interest and similar) and the Microsoft Forms memorial donation form. **Open decision:** where form submissions go (for example email to the office, stored in Sanity, or both).
- Office staff must be able to update dates, rates, camps, events and news themselves each season in Sanity Studio.
- The old site has many historical news posts and past-year pages (2020 virtual camps, 2021 spring virtual camps, AmazonSmile). **Open decision:** archive, redirect or remove, per the Miro sitemap.
- **Content conflicts to resolve, not to copy:**
  - The Camp Setebaid page says ages "7–14" in one place and "13–17" in another.
  - The history claims differ ("over 35", "over 42", "over 43" years). Use the founding years instead of "over N years".
  - The HDYC fee table spells "Campership" as "Camperhsip".
- **Terminology:** "camper", "campership" (a scholarship for camp), "Campership Fund", "Tier I–IV", "CIT", "T1D", "HDYC".

## Brand Commitments

- **Name:** Setebaid Services® (the legal name is Setebaid Services, Inc.). "Setebaid®" and "Camp Setebaid®" carry the registered mark on the old site. Campers chose the name: it is "diabetes" spelled backwards, from the idea "turn diabetes around".
- **Voice (from the existing copy):** warm, encouraging and family-facing. The copy stresses fun, friendship and independence, and treats medical safety as quiet competence, not fear. Campers are kids first.
- **Commitment to inclusion:** the Philosophy statement on diversity, equity and inclusion, and the commitment to the health, safety and welfare of campers and staff.

## Evidence on Hand

The user confirmed that these exist. They are **not in the repo yet** and must be collected before visual work uses them:

- Official logo files.
- Real camp photos with permission to publish (the old site also links Flickr albums).
- Camp video (the old home page has a YouTube video: https://www.youtube.com/watch?v=VqXLCz9T65A).
- Real testimonials, and the research on reduced diabetes-related stress.

In the repo: the full text of the old site as Markdown in `build/pages/` (115 pages), with an alumni quote on the Parents page and the payment and refund policy link on Dates & Rates.

Do not invent testimonials, statistics, camper counts, accreditations, medical claims or staff names. Use only what the real content or the client supplies.

## Product Principles

1. **Parents first:** every page must help a parent answer "is this right and safe for my child, when is it, what does it cost, how do I register?"
2. **Kids who just happen to have diabetes:** show camp as camp: fun, friends and independence. Diabetes care is present and expert, but it is not the headline fear.
3. **Every child can come:** the tiered pricing and campership help are shown openly and without shame, next to the prices, not hidden.
4. **Truth over filler:** use real photos, real people and real dates. Resolve conflicting facts and do not repeat them. No invented proof.
5. **The office runs it:** seasonal facts (dates, rates, deadlines, events) are content that staff edit, never hard-coded.

## Accessibility & Inclusion

WCAG 2.2 AA (confirmed). The audience includes stressed first-time parents on phones, grandparents, and families who need financial help. Use plain language, readable type, and forms that work with assistive technology.
