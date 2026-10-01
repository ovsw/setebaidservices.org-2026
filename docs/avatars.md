# Customer avatars

Who the Website serves, what they need, and which pages carry each of them.
Read this before running the six-step page workflow (avatar, jobs, content,
layout, design system, polish). Steps 1 to 3 draw from here.

Status: first draft, 2026-09-04, built from the old site copy, the blog,
`frontend/PRODUCT.md`, and the funnel ADR. Client sales knowledge still needs
to correct it. Facts marked as gaps are things the old site never states.

## The five avatars at a glance

| Avatar | Who | Device | Entry CTA | Exit CTA |
|---|---|---|---|---|
| Cautious Carla | First-time GTA parent, child 8 to 11 | Phone first, desktop to compare | Fit quiz | Talk to the Directors, then Enroll |
| Repeat Rachel | Returning or alumni parent | Phone | Dates & Rates | Enroll |
| Marisol | International parent, child 10 to 15 | Phone first, desktop to compare | Fit quiz | Talk to the Directors, then Enroll |
| Maya | The camper, 8 to 16, influencer not buyer | Laptop with parent, or own phone | None | Hands off to parent with a program named |
| Summer-Job Sam | Prospective staff, or leadership candidate and parent | Phone, then laptop | None | CampBrain staff portal |

Funnel rule from the ADR and the Whimsical board: the site is the information
tier. No "Request Info" form anywhere. Lifecycle stages are Audience, Visitor,
Lead (shares contact via quiz or lead magnet), Qualified Lead (books a call
with Justin, the director), Opportunity (attended the call), Customer
(enrolled), Family Member (refers). Carla and Marisol need the call before
money moves. Rachel needs speed and must never see the fit quiz.

Board tags map to avatars: `#parent` = Carla and Marisol, `#enrolled` = Rachel,
`#camper` = Maya, `#staff` = Sam. The board does not separate international
parents; this doc does, because their questions differ enough to shape pages.

## Page to avatar matrix

P = primary, S = secondary, blank = not for them. Legal pages serve everyone
equally and are left blank.

Tier comes from the nav card sort on the Whimsical board
(`https://whimsical.com/ovsw/cac-3vNoFam9jPZKggghD9rU5U`). Tier 1 is read by
every parent before buying. Tier 2 is why CAC and not another camp. Tier 3
handles one specific objection. "ext" is an external link or download.
Tier 1 and 2 pages go through the six-step workflow first.

| slug | Carla | Rachel | Marisol | Maya | Sam | Tier |
|---|---|---|---|---|---|---|
| /accommodation-and-facilities | P | S | S | P | | 3 |
| /adult-summer-camp |  |  |  |  | | 3 |
| /all-new-youth-leadership-program |  | S |  | S | P | 3 |
| /alumni |  | S |  |  | | 3 |
| /camp-pictures | S |  | S | P | | 3 |
| /camp-video | S |  | S | P | | 3 |
| /canadian-adventure-camp-experience | P |  | P | S | | 1 |
| /contact | S | S | S |  | S | 3 |
| /dates-and-rates | P | P | P | S | | 1 |
| /download-parent-guide | S | P | S |  | | ext |
| /faqs | S | S | S |  | | 3 |
| /faqs-prospective-families | P |  | P |  | | 3 |
| /food-and-sample-menu | S | S | S | S | | 3 |
| /great-leadership |  |  |  |  | S | 2 |
| /health-and-safety | P | S | P |  | | 1 |
| /international-campers |  |  | P | S | | 3 |
| /join-our-team |  |  |  |  | P | 3 |
| /junior-staff |  |  |  | S | S | 3 |
| /leadership-one-course |  | S |  | S | S | 3 |
| /leadership-two-program |  | S |  | S | S | 3 |
| /memeberships-partnerships | S |  | S |  | | 3 |
| /nccp-courses |  |  |  |  | S | 3 |
| /nccp-courses-and-adult-camp |  |  |  |  | S | 3 |
| /our-summer-camp-history-and-goal | S |  | S |  | S | 2 |
| /parent-log-in |  | P | S |  | | ext |
| /photos-and-videos | S | S | S | P | | 3 |
| /places-to-stay-when-visiting |  | S |  |  | | 3 |
| /privacy-policy |  |  |  |  | | 3 |
| /adventure-island | P | S | P | P | | 2 |
| /programs/aerials-specialty-program | S |  | S | P | | 2 |
| /programs/general-camp-program | P |  | S | P | | 3 |
| /programs/specialty-gymnastics-program | S |  | S | P | | 2 |
| /programs/specialty-summer-camp-programs | S |  | S | S | | 2 |
| /programs/trampoline-specialty-program | S |  | S | P | | 2 |
| /programs/water-ski-and-wake-boarding-specialty-program | S |  | S | P | | 2 |
| /staff | P |  | P |  | S | 3 |
| /staff/available-positions |  |  |  |  | P | 3 |
| /staff/community-initiatives |  |  |  |  | S | 3 |
| /staff/international-staff |  |  |  |  | P | 3 |
| /staff/staff-application |  |  |  |  | P | ext |
| /stay-in-touch-with-your-camper | S | S | S |  | | 3 |
| /summer-camp-activities | P | S | S | P | | 1 |
| /terms-and-conditions |  |  |  |  | | 3 |
| /testimonials | P |  | P | S | | 1 |
| /transportation | S | S | S |  | | 3 |
| /transportation/airport-service |  | S | P |  | | 3 |
| /transportation/travel-by-bus | S | S |  |  | | 3 |
| /transportation/travel-by-car | S | S |  |  | | 3 |
| /visitor-days |  | P |  |  | | 3 |
| /website-accessibility-policy |  |  |  |  | | 3 |

## Cross-cutting gaps on the old site

These failures show up in three or more avatars. Fix them once, in shared
content, not page by page.

- **Age range never stated.** Every parent avatar asks it first.
- **No prices on Dates & Rates.** Fees live in a reused block or behind
  CampBrain. Rachel and Marisol both stall here. Currency never shown.
- **No per-session availability.** Rachel fears filling, Carla cannot plan.
- **Contact page is empty.** No phone, hours, summer address, time zone.
- **Both FAQ pages are empty shells.**
- **Homesickness and the phone rule** live only in blog posts. Carla, Maya,
  and Marisol all need them on main pages.
- **Photo and video pages are link-outs** to SmugMug and YouTube. Maya's first
  question sends her off-site.
- **Jargon unexplained:** Twinkie, Winits, Flintstone Field, Big Top.
- **"Enroll Now" never says it leaves for CampBrain.**
- **Airport and international logistics** stop at "notify the office".
- **Staff pay, dates, and days off** are never stated.

---

## Cautious Carla

**GTA mom sending her 9-year-old away for the first time, comparing four camps.**

### Who they are

Two-parent household in Vaughan, Markham, or North Toronto. Child is 8 to 11, day camp only, never slept away. Carla researches; her partner checks price and dates; the child vetoes on "does it look fun". Camp-parent friends influence most.

### What triggers the visit

October to February, when friends talk about sign-ups. Source: a friend, an OCA camp fair, a school group chat, or a Google search for "overnight camp Ontario gymnastics". First visit on her phone, evening, from a shared link. Return visit on desktop to compare dates and prices against other camps.

### Top questions, in order

1. Is this camp legit and safe? /health-and-safety, /memeberships-partnerships
2. Who sleeps in the cabin and how old are staff? /accommodation-and-facilities, /staff
3. Is a first-timer ready for two weeks on an island? Unanswered on old site.
4. What if she gets homesick? Can I hear from her? /stay-in-touch-with-your-camper (CACmail only, no homesickness policy)
5. All-in cost and when do I pay? /dates-and-rates lists inclusions and deadlines, not prices.
6. Which sessions are still open? /dates-and-rates. No availability shown.
7. How does she get there? /transportation/travel-by-bus
8. Does she pick her own activities? /programs/general-camp-program
9. Kids her age? Must she be an athlete? Age range unanswered on old site.
10. What do other parents say? Can I talk to someone? /testimonials, /contact (empty)

### Objections and fears

- Two weeks minimum; other camps offer one week for first-timers.
- Boat-only island sounds hard to leave in an emergency.
- Full cost unknown until CampBrain.
- Bus, tax, and tuck are extra and easy to miss.
- No phones. How will she know her child is okay?
- Specialty focus: will a non-gymnast fit in?
- A 19-year-old counsellor sounds young.
- "Twinkie" and "Winits" mean nothing to her.

### What "confident enough" looks like

A named adult is responsible for her child at night. A doctor is on site. Other first-timers her child's age come back happy. She gets photos and letters during the session. Deposit is refundable until March 31. She has one price to quote to her partner.

### Desired action

Fit quiz on the first phone visit; she is not ready to commit. Talk to the Directors after reading Health & Safety and Dates & Rates. Enroll after the call or after a friend confirms. Dates & Rates is her return-visit landing page.

### Pages this avatar cares about

| slug | why they visit it | priority |
|---|---|---|
| /health-and-safety | doctor, accreditation, certifications | primary |
| /dates-and-rates | dates, price, refund, sibling discount | primary |
| /staff | counsellor age, training, ratio | primary |
| /accommodation-and-facilities | cabin size, who sleeps there | primary |
| /programs/general-camp-program | daily schedule, activity choice | primary |
| /testimonials | other parents | primary |
| /transportation/travel-by-bus | Yorkdale pickup, times, cost | secondary |
| /stay-in-touch-with-your-camper | CACmail | secondary |
| /food-and-sample-menu | picky eater, allergies | secondary |
| /faqs-prospective-families | expects answers, finds none | secondary |
| /contact | phone, office hours | secondary |
| /programs/specialty-* | only if child asks | none |
| /international-campers | not relevant | none |

### Evidence and gaps

Leaned on: staff 19+, counsellor sleeps in cabin, ratio better than 3:1, full-time doctor with named hospitals, OCA and CCA 400+ standards, cabins max 10, refundable deposit to March 31, $150 tuck, bus $265 from Yorkdale, CACmail, no-cell-phones and Twinkie counsellor blog posts, PRODUCT.md, funnel ADR.

Old site fails this avatar on:

- Age range. Never stated; "aged 7 to 9" appears once in a schedule note.
- Homesickness. No policy, no first-timer page, no parent call rule.
- Price. Dates & Rates copy has no session fees.
- Availability. No Open, Limited, or Full status.
- Two-week minimum never framed for a nervous first-timer.
- FAQ pages have empty bodies in the export.
- Contact page has no copy. Phone and office hours absent.
- Jargon (Twinkie, Winits, Flintstone Field) unexplained.
- Emergency evacuation never stated as a plan.

---

## Repeat Rachel, the re-enroller

**A parent whose child already loves CAC. She wants dates, price, sibling discount, and the enroll button in under two minutes.**

### Who they are

- Toronto-area household, or an international family that has used the airport package before. Some are CAC alumni.
- Child 10 to 15, one to four summers at CAC. Often a sibling of 8 or 9 is about to start.
- The child decides "I am going back" and wants the same session as cabin friends. The parent decides length and whether both kids go.

### What triggers the visit

- Re-enrollment email from camp, September to November, or another parent asking which session they picked.
- Second wave January to March as the Mar 31 refund deadline nears.
- Third wave June to August: forms, bus times, Visitors' Day, CACmail.
- Mostly phone: she taps through from the camp email or a group chat. Desktop only to fill CampBrain forms.

### Top questions, in order

1. Next year's session dates? `/dates-and-rates`
2. Cost per session length? `/dates-and-rates` (prices sit in a reused block; none in the exported copy)
3. Is our session still open? Unanswered on old site.
4. How does the sibling discount work? `/dates-and-rates`
5. Deposit and refund deadline? `/dates-and-rates`, `/download-parent-guide`
6. Where do I log in to re-enroll and do forms? `/parent-log-in`
7. Bus price and times? `/download-parent-guide`, `/transportation/travel-by-bus`
8. Visitors' Day date and cost for our session? `/visitor-days`, `/places-to-stay-when-visiting`
9. How do I send mail and see photos? `/stay-in-touch-with-your-camper`, `/photos-and-videos`
10. What is new this summer? Partly `/all-new-youth-leadership-program`; otherwise unanswered.

### Objections and fears

- "It filled before I got to it." Sessions sell out; the old site never says which.
- "The price went up and I cannot see it without logging in."
- "Two kids for four weeks is a big number. Does the discount cover transport?"
- "Is the younger one old enough?" Age band is not on the pages she visits.
- "Did the airport rules change?" International returners re-check the after-7pm return flight rule.
- "Same directors, same coaches?"

### What "confident enough" looks like

She must believe: her session is open, price and discount match expectation, the deadline is not tomorrow, and login goes to last year's account.

### Desired action

**Enroll** (CampBrain) from Dates & Rates, first visit. No director call; she phones only if something looks wrong. A **Dates & Rates** link in header and footer is her whole funnel. Never show her the fit quiz.

### Pages this avatar cares about

| slug | why they visit it | priority |
|---|---|---|
| /dates-and-rates | dates, prices, discount, deadlines, enroll | primary |
| /parent-log-in | re-enroll, forms, balance | primary |
| /visitor-days | date, boat and lunch cash | primary |
| /download-parent-guide | forms, packing, bus, payment schedule | primary |
| /transportation/travel-by-bus | bus price and times | secondary |
| /transportation/airport-service | flight rules (international) | secondary |
| /stay-in-touch-with-your-camper | CACmail, postal address | secondary |
| /photos-and-videos | SmugMug, YouTube | secondary |
| /places-to-stay-when-visiting | hotels for Visitors' Day | secondary |
| /contact | office and summer phone | secondary |
| /faqs | quick answers | none (empty) |

### Evidence and gaps

Leaned on: PRODUCT.md verified facts (dates, sibling 5% and 10%, refund to Mar 31, tuck $150, bus and taxes extra, staff-set availability); ADR funnel (Enroll primary, no info form); old pages listed above; blog posts on returning campers.

Old site fails her on:

- No availability per session.
- Prices live in a reused block; dates and prices are not on one table.
- `/contact` is empty. No summer phone, hours, or address.
- Both FAQ pages are empty shells.
- `/parent-log-in` is one paragraph with no form deadlines.
- Visitors' Day dates, fees, boat times, and hotels are split over three pages.
- Sibling discount does not say if "2nd enrollment" means a second child.
- No "what changed this year", no re-enrollment deadline, no returner benefit.
- "Enroll Now!" never shows that the link leaves the site for CampBrain.

---

## Marisol, the long-distance parent
**A parent in Mexico City, Madrid or Hong Kong sending a 12-year-old to Canada alone.**

### Who they are
Urban, upper-middle income. Child is 10 to 15, usually 11 to 13 on the first trip, with some English. Immersion and independence are half the reason. No prior overnight camp abroad. Mother researches and decides, father checks cost and safety, the child pushes for a specialty program seen on Instagram. Referrer: a returning international family or an agent.

### What triggers the visit
October to February, before the March 31 refund deadline. Word of mouth, an Instagram reel, or an agent. First visit on the phone from a shared link. Serious research moves to desktop to compare camps in tabs and fill CampBrain forms.

### Top questions, in order
1. Is this an accredited camp run by trustworthy adults? (/health-and-safety, /staff)
2. Who meets my child at Pearson, and what happens before the island? (/transportation/airport-service)
3. Which flight do I book, and how is unaccompanied minor status handled? (/transportation/airport-service, partial)
4. What does the airport package cost, in which currency? (unanswered on old site)
5. Will my child cope with English and distance? (/international-campers, thin)
6. How do we communicate across time zones? (/stay-in-touch-with-your-camper; no time zone mention)
7. If my child gets sick, who pays, and is a foreign camper insured? (/health-and-safety, covers the camp, not the camper)
8. Visa, eTA, or consent letter for a minor travelling alone? (unanswered on old site)
9. How do I pay from abroad? (/dates-and-rates, partial: deadline yes, currency no)
10. Which session fits, and is space left? (/dates-and-rates)

### Objections and fears
- A stranger meets my child at the airport and I have never seen their face.
- The return flight rule (after 7pm Sunday) is buried; a wrong booking costs a hotel night.
- My child will be the only non-native speaker in the cabin.
- No phones means weeks of silence. CACmail exists, but no stated turnaround.
- Prices show "$" with no currency; the true total is scattered.
- The camp holds passports; she wants to know why and where.

### What "confident enough" looks like
She can name the role that meets her child at YYZ, describe the Toronto night, and state the full cost in CAD. She has seen the doctor, the accreditation, and a story from a family in her region. She believes camp will call her, in her time zone, if something goes wrong.

### Desired action
Talk to the Directors, once questions 1 to 4 are answered on the site. She needs a human voice before money leaves the country. The fit quiz suits early phone visits from Instagram. Enroll follows the call.

### Pages this avatar cares about
| slug | why they visit it | priority |
|---|---|---|
| /transportation/airport-service | package, flight rules, UM status | primary |
| /international-campers | proof foreign kids thrive here | primary |
| /health-and-safety | doctor, staff age, accreditation, insurance | primary |
| /dates-and-rates | dates, inclusions, refund deadline | primary |
| /stay-in-touch-with-your-camper | CACmail, postal address | secondary |
| /download-parent-guide | forms, medication, summer contact | secondary |
| /visitor-days | she will not visit | none |

### Evidence and gaps
Leaned on: airport package list, flight rules, UM notification, passport collection (/transportation/airport-service); staff 19+, doctor, OCA and CCA, National Insurance Program (/health-and-safety); CACmail; March 31 deadline (/dates-and-rates); PRODUCT.md principle 5.

Gaps on the old site:
- No airport package price; no currency stated anywhere.
- No named role, photo, or ratio for the Pearson meet and greet or Toronto overnight.
- UM process stops at "notify the office": no airline list, receiving adult, or parent forms.
- Visa, eTA, and consent letter for a minor travelling alone: nothing.
- Camper medical insurance absent; the insurance text covers the camp's liability.
- No international phone format, time zone for office hours, or response-time promise.
- English level and language support: one line.
- No testimonial identified by country.
- Payment from abroad (wire, card, conversion) not stated.
- /international-campers is one paragraph; it should be the hub linking all of the above.

---

## Maya the Influencer

**The camper, 8 to 16, who decides whether the parent hears "yes".**

### Who they are

- Ages 8 to 16. Youngest are "Twinkies" (7 to 9). Leadership One starts at 16.
- **Shown the site (8 to 12):** beside a parent on a laptop. Parent scrolls, kid points. Seconds per screen. Photos and video only, skips text.
- **Browsing alone (13 to 16):** phone, from a friend's link or Instagram. Skims headings, taps photos, watches the film if it loads fast, finds their sport.
- Shows the parent: Tarzan swing, Big Top, ski docks, food list, "this is the program I want".

### What triggers the visit

- Parent handoff: "look at this" (laptop, evening).
- A friend or teammate went last summer (phone, same day).
- A camp reel on Instagram or YouTube (phone).

### Top questions, in order

1. What does it look like? `/photos-and-videos`, `/camp-pictures`, `/camp-video` (all link out to SmugMug and YouTube).
2. What do I do all day? `/summer-camp-activities`, `/programs/general-camp-program`.
3. Can I do my sport, is coaching serious? The four `/programs/*-specialty-program` pages.
4. Must I pick a specialty? `/programs/general-camp-program` (recreational versions every afternoon).
5. Where do I sleep, with who? `/accommodation-and-facilities` (bunks, max 10, counsellor in cabin). Cabin photos, bunking with a friend: unanswered on old site.
6. What is the food? `/food-and-sample-menu`.
7. Will I know anyone? `/canadian-adventure-camp-experience`, `/international-campers` (vague). Concretely unanswered on old site.
8. Can I bring my phone? Blog post only. Unanswered on main pages.
9. Overnight trip, evening program, Winits? `/programs/general-camp-program`, `/programs/specialty-summer-camp-programs`.
10. (Teens) Leadership path? `/all-new-youth-leadership-program`, `/leadership-one-course`.

### Objections and fears

- Homesickness, especially first-timers on long sessions.
- Arriving alone while everyone else has friends.
- Being bad next to "national level athletes" (old-site copy).
- No phone for weeks. Losing streaks and group chats.
- Cabin mates they do not like, no privacy.
- Cold lake, 7:15 dip. Food they will not eat.
- Meme risk: "Adventure Island", private island, boat access. Teens will make Epstein island jokes. Naming and imagery should not feed it. Flag, do not dwell.

### What "confident enough" looks like

- Seen kids their age in real photos and video.
- Can name three things to do on day one.
- Knows beginners are welcome and experts still get real coaching.
- Believes they will find a friend: cabin group, other first-timers.
- Knows the phone rule up front, said with humour.

### Desired action

No direct CTA. Handoff: kid says "this one" and names a program and session. Give them a phone-shareable program page, a "show your parent" moment (film, build-a-day), and a clear path to Dates & Rates and Enroll.

### Pages this avatar cares about

| slug | why they visit it | priority |
|---|---|---|
| `/photos-and-videos`, `/camp-video`, `/camp-pictures` | real camp, the film | primary |
| `/summer-camp-activities` | what they can do | primary |
| `/programs/general-camp-program` | schedule, overnight trip | primary |
| `/programs/*-specialty-program` (four) | their sport | primary |
| `/accommodation-and-facilities` | cabins, Big Top, beach | primary |
| `/programs/specialty-summer-camp-programs` | compare, Winits | secondary |
| `/food-and-sample-menu` | food | secondary |
| `/all-new-youth-leadership-program` | teens planning ahead | secondary |
| `/health-and-safety`, `/transportation/*` | parent pages | none |

### Evidence and gaps

**Leaned on:** PRODUCT.md (kids as secondary users, 35 activities, film, phone line, build-a-day). Old site: activity list, sample schedule, cabin facts, menu, specialty hours, "beginners to national level", Winits, overnight trip, YLP stages. Blog: no-phones, nervous camper, cabin mates posts.

**Old site fails this avatar on:**
- Photo and video pages are link-outs. Question one sends the kid off-site.
- One paragraph on cabins, no photos, no "bunk with my friend" answer.
- Phone rule buried in a blog post, absent from program and FAQ pages.
- Homesickness support is a parent blog post. Nothing written to the kid.
- Specialty pages open with "Limited Spots" and credentials. "Beginners welcome" comes sections later.
- No camper-voice copy. "What our campers say" sections are empty titles.
- Activities page is a bare list titled "Activities test". No photos.
- No one-screen phone page a teen can send a friend.

---

## Summer-Job Sam
**A university-age applicant, or a 16 to 17 year old leadership candidate and parent, who wants role, pay, dates, and how to apply.**

### Who they are
- **Mode A: university applicant.** 19 to 24, Canadian or international (Australia, Ireland, New Zealand, Colombia on the old site). Wants a paid summer outdoors plus lifeguard, first aid, or NCCP credentials. Roles: counsellor, coach, lifeguard, kitchen, service crew.
- **Mode B: leadership candidate and parent.** 16 to 17, usually a returning camper. Parent pays for Leadership One or Two. Teen wants paid Junior Staff at 18.

### What triggers the visit
- Camp job boards, university fairs, staffing agencies.
- Alumni and past staff word of mouth.
- Staff video and counsellor blog posts.
- Mode B comes from the camper journey.
- Mostly phone; applications finish on a laptop.

### Top questions, in order
1. What positions are open and what does each do? `/join-our-team`, `/staff/available-positions` (only kitchen, service crew, waterski coach listed).
2. What are the dates and contract length? Unanswered on old site.
3. What is the pay? Unanswered on old site ("highly competitive wage", waterski only).
4. What certifications do I need, and does camp help me get them? `/staff`, `/staff/international-staff`, `/nccp-courses`.
5. I am not Canadian. Can I work there, and who does the permit? `/staff/international-staff`.
6. Where do I sleep, and is there time off? Partly `/staff`, `/accommodation-and-facilities`; days off unanswered on old site.
7. (Mode B) How do I go from camper to Junior Staff, and what does it cost? `/all-new-youth-leadership-program`, `/leadership-two-program`, `/junior-staff`.
8. How do I apply and what happens next? `/staff/staff-application` (one heading, no process).

### Objections and fears
- "Remote island. No phone, cannot leave on a day off."
- "Pay will not cover my flight and permit."
- "No lifeguard ticket, so I cannot apply."
- "The permit process sounds hard."
- "I do not know gymnastics, so there is no role for me."
- "The application page is a dead end."
- Mode B parent: "Leadership Two is $5150 plus tax. Is Junior Staff guaranteed?"

### What "confident enough" looks like
They can name their role, know dates and pay range, know which certifications camp provides, and (international) know camp handles the permit. Mode B parent understands the three stages and that Junior Staff is paid.

### Desired action
Click "Apply Now" to the CampBrain staff portal (https://canadianadventurecamp.campbrainstaff.com/). Show the CTA on Join Our Team, each position block, and the international page, after questions 1 to 5 are answered. Mode B enrols via camper CampBrain registration, not the staff portal.

### Pages this avatar cares about
| slug | why they visit it | priority |
|---|---|---|
| /join-our-team | entry, roles, apply link | primary |
| /staff/available-positions | role details | primary |
| /staff/international-staff | permits, support | primary |
| /staff/staff-application | CampBrain handoff | primary |
| /all-new-youth-leadership-program | Mode B path | primary |
| /staff | age, training, certifications | secondary |
| /leadership-two-program | Mode B, price | secondary |
| /junior-staff | paid role at 18 | secondary |

### Evidence and gaps
Leaned on: PRODUCT.md (CampBrain staff portal link); `/staff` (19+, average age 22, First Aid, Bronze Cross, National Lifeguard, counsellor lives in cabin); `/staff/international-staff` (camp-specific work permit, qualifications provided); `/staff/available-positions`; YLP pages (three stages, Leadership Two price, Junior Staff paid); counsellor blog posts.

Old site fails to answer: pay, contract dates, days off, phone policy, staff housing, counsellor and coach job descriptions, hiring timeline, post-application steps.
