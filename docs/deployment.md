# Deployment

The Website and Studio are separate applications.

| Part | Where |
| --- | --- |
| Website | Vercel project `setebaid-2026` on the Studio ROVST team, preview address `setebaid-2026.vercel.app` |
| Studio | `setebaid.sanity.studio` |
| Content | Sanity project `o36mi5w4`, dataset `production` |
| Code | GitHub `ovsw/setebaidservices.org-2026`, production branch `main` |

## Website on Vercel

1. Import the GitHub repository into Vercel as the project `setebaid-2026`.
2. Set the project root directory to `frontend`.
3. Add the variables from `frontend/.env.local.example`. Set
   `NEXT_PUBLIC_SITE_ENV=production` in Vercel's Production environment so the
   deployed site is indexable. Keep `development` locally and for Preview
   deployments so unfinished revisions remain `noindex`.
4. Use `main` as the production branch.
5. A ruleset on `main` requires the GitHub `Release gate` check before a pull
   request can merge. Repository admins may bypass it; do not.

Vercel may create preview deployments for pull requests. Production deploys come only from verified revisions merged into `main`, or from a rebuild of `main` when a redirect changes (below).

## Redirects go live on publish

The Website compiles the published Redirect documents into its redirect rules
at build time, so they run before any site code. A Sanity webhook starts a new
production build when a published redirect changes. The change is live a few
minutes after you publish, when that build is ready.

| Setting | Value |
| --- | --- |
| Vercel deploy hook | Name `sanity-redirects`, branch `main`, in the project's Git settings |
| Sanity webhook | Name "Rebuild the Website when a redirect changes", in the project's API settings |
| Dataset | `production` |
| Trigger | Create, update and delete |
| Filter | `_type == "redirect"` |
| Drafts and versions | Off, so draft edits do not start a deploy |
| Projection | `{_id}` |
| HTTP method | `POST`, to the deploy hook URL |

The deploy hook URL is a secret: anyone who has it can start a deploy. It is
kept only in Vercel, in the Sanity webhook, and in the local setup file (see
[Where the keys go](#where-the-keys-go)). Section b of `pnpm setup:qr` creates
both settings and checks them; re-run it to check them again.

To confirm that it works, publish a change to a redirect. A new production
deployment from the hook `sanity-redirects` appears in Vercel within a few
seconds. When it is ready, the changed rule works on the Website.

## Studio on Sanity

Add the local values from `studio/.env.local.example`. Confirm that the
deployed Website origin in `studio/.env.production` is correct. Then deploy
manually from the repository root:

```bash
pnpm setup:sanity-cors
pnpm deploy:studio
```

`pnpm deploy:studio` and `pnpm --dir studio deploy` use the same guard. They
take the preview origin and Studio app ID from `studio/.env.production`,
even when the terminal has local values set. The auth token comes from
`studio/.env.local`. A missing setting, local address, or non-HTTPS preview
stops the command before build or upload. The command always builds a fresh
Studio; it does not accept arguments that could skip the build.

Do not deploy with `sanity deploy` directly or preload `.env.local` into the
terminal. Direct CLI deployment bypasses the guard.

Studio deployment remains manual. Vercel deployment uses the existing project configuration and credentials.

## Accounts and keys for the QR mechanism

The QR mechanism (spec #43) needs accounts and keys that only Ovi can create.
A guided script walks through them, one section at a time:

```bash
pnpm setup:qr          # shows the sections and asks which to run
pnpm setup:qr a b      # runs sections a and b only
```

| Section | What it sets up | Unblocks | Phase |
| --- | --- | --- | --- |
| a | Vercel Web Analytics, and the Web Analytics Plus add-on for the Studio ROVST team | #49 | 1 |
| b | A Vercel deploy hook on `main`, and a Sanity webhook that calls it when a published Redirect is created, changed or deleted | #48 | 1 |
| c | A Formspark workspace (upgraded, for API access), the "Ask about camp" form, and an API token that can read and delete submissions | #50, #52 | 2 |
| d | A Trigger.dev project, two Production keys, and an email alert for failed runs | #51, #52, #53 | 2 |
| e | A Neon project on the Free plan, and its pooled connection string | #51, #54 | 2 |
| f | A Vercel API token that the analytics copy job uses | #53 | 2 |
| g | An encryption key for form entries, generated on this computer | #51 | 2 |

Each section ends with a check that the service accepts the new key. Where a
service has no API for the check (Web Analytics Plus), the
script asks you to confirm what the dashboard shows.

The script needs `node`, `jq`, the Vercel CLI (logged in with access to the
Studio ROVST team), `psql` for section e, and `openssl` for section g. Section b
reads `SANITY_AUTH_TOKEN` from `studio/.env.local` to create the Sanity webhook.

### Where the keys go

The script never prints a secret and never writes one into the repository.

| Variable | Vercel (Production, Preview) | Trigger.dev (prod) | Section |
| --- | --- | --- | --- |
| `FORMSPARK_FORM_ID` | yes | yes | c |
| `FORMSPARK_API_TOKEN` | | yes | c |
| `TRIGGER_SECRET_KEY` (the "website" key) | yes | | d |
| `DATABASE_URL` | yes | yes | e |
| `VERCEL_ANALYTICS_TOKEN` | | yes | f |
| `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` | | yes | f |
| `FORM_ENCRYPTION_KEY` | yes | yes | g |

Vercel stores each one as a sensitive variable. New values reach the Website
with its next deployment.

The script also keeps every value in `~/.config/setebaid/qr-mechanism.env`,
outside git and readable only by you. Set `QR_SETUP_ENV_FILE` to use another
path. A re-run offers the saved values, so press Enter to keep them. The file
also holds two values that go nowhere else: the deploy hook URL, and the
Trigger.dev "setup-script" key that lets the script write Trigger.dev
variables.

Sections c, e, f and g write to Trigger.dev only after section d has run.
Section d copies every value that is already saved, so the order does not
matter. Section g keeps the saved encryption key unless you choose to replace
it, because a new key makes requests that still wait for a retry unreadable.

### Form entries in Neon

Each "Ask about camp" request goes on two paths at the same time: to
Formspark, which emails the office, and, encrypted, to the Trigger.dev task
`store-form-entry`, which writes it to Neon and retries for about two and a
half hours. The request counts as sent when one path accepts it. The nightly
gap-filler (#52) copies each request that reached Formspark but not Neon, and
reports it.

The free plan of Trigger.dev allows one alert destination. Section d sets it
to Ovi's email for task run failures in Production, so the last failed attempt
of any task sends an email.

### Analytics copy in Neon

Every hour, the Trigger.dev task `copy-analytics` copies the production page
views and the `qr_scan`, `call_tap` and `email_tap` counts from Vercel Web
Analytics into Neon, one daily total per Source, page and metric. A day is an
Eastern (America/New_York) day. The first run copies every day since Web
Analytics was enabled; later runs copy again from the day before their last
success, and replace those days' numbers. Section f gives it its keys.

After sections d, e and g have run, and again after each change under
`frontend/db/migrations` or `frontend/trigger`:

```bash
pnpm db:migrate                                   # creates or updates the Neon tables
pnpm trigger:deploy                               # needs `npx trigger.dev login` one time
```

`pnpm db:migrate` reads `DATABASE_URL` from the file that `pnpm setup:qr`
keeps. It applies each file in `frontend/db/migrations` one time, in name
order.

## Before the first production deploy

- Run `pnpm verify`.
- Run `pnpm setup:sanity-cors` to add the Website and Studio origins to the
  Sanity project's CORS settings.
- Confirm the Vercel root directory is `frontend`.
- Confirm the GitHub `Release gate` check is required on `main`.
- Confirm the Studio hostname is `setebaid`.
