# Deployment

The Website and Studio are separate applications.

## Website on Vercel

1. Import the GitHub repository into Vercel.
2. Set the project root directory to `frontend`.
3. Add the variables from `frontend/.env.local.example`. Set
   `NEXT_PUBLIC_SITE_ENV=production` in Vercel's Production environment so the
   deployed site is indexable. Keep `development` locally and for Preview
   deployments so unfinished revisions remain `noindex`.
4. Use `main` as the production branch.
5. A ruleset on `main` requires the GitHub `Release gate` check before a pull
   request can merge. Repository admins may bypass it; do not.

Vercel may create preview deployments for pull requests. Production deploys come only from verified revisions merged into `main`.

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

## Before the first production deploy

- Run `pnpm verify`.
- Run `pnpm setup:sanity-cors` to add the Website and Studio origins to the
  Sanity project's CORS settings.
- Confirm the Vercel root directory is `frontend`.
- Confirm the GitHub `Release gate` check is required on `main`.
- Confirm the Studio hostname is correct.
