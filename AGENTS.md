<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `frontend/node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Dev Server rules

Before starting a development server, inspect the required port. If the exact server you need is already running there, reuse it.

## Sanity browser checks (Codex)

For local frontend reviews, open the draft-preview version of the page and
preserve its preview parameters, including `sanity-preview-perspective=drafts`.
Verify that known draft-only content and the expected sections are visible
before reviewing or taking screenshots. A Studio login, preview query parameter,
or HTTP 200 alone is not proof that the frontend is showing drafts. If content
is missing or the published version appears, report the mismatch and restore
draft preview before continuing the visual review.

When Ovi asks for a browser check of Sanity in Codex, use the ChatGPT in-app
browser. Never use the Next.js loop browser to open or inspect Sanity Studio or
any Sanity URL. Whether to open a browser at all is governed by "Fast
verification" below.

## Shell discipline and reporting observations

The Bash tool's working directory **persists between calls**. A `cd` in one
command silently changes what every later relative path resolves to. This has
already produced confidently-wrong claims about missing files.

- Run every command from a known cwd: use absolute paths, or `cd` to the repo
  root first. Never rely on inherited shell state.
- Do not use `2>/dev/null` on any command whose output feeds a conclusion. A
  suppressed error and an empty result look identical and mean different things.
- Do not chain independent checks with `&&` — the first failure hides every
  check after it. Use `;` or separate calls.
- **Never report a file as missing, deleted, or changed on the strength of one
  failed check.** Re-verify from an absolute path first.
- Report what was observed, not what was inferred: "the check returned nothing"
  is a different claim from "the file does not exist." Never attribute a change
  to the user's actions without direct evidence.
- When a new result contradicts an earlier observation in the same session,
  stop and re-verify. The newer result is not automatically the correct one.

This matters most before destructive or delegated work: unverified claims about
environment state (which dataset is configured, which env file is loaded) are
exactly what makes handing off write access dangerous.

## Sanity dataset writes

Ovi gives standing permission for Sanity dataset mutations required by the
current task.

- This permission includes creating draft content, inserting Page Builder
  sections, and migrating affected documents into changed schema shapes.
- Sanity-backed work is complete only when required content exists in the
  dataset in the shape the code expects. Use supplied or reference content;
  when none exists, write practical draft content and identify it in the
  handoff. Do not leave content entry or reshaping to Ovi.
- For feature work, write to drafts. When a migration must update existing
  stored shapes, preserve each document's draft or published state. Never
  publish a draft unless Ovi asks.
- Before the first write, name the project and dataset, create a timestamped
  backup, and verify the archive with `gzip -t`. If backup or verification
  fails, stop before writing.
- For document-only work, use
  `sanity datasets export <dataset> <backup>.tar.gz --raw`. This avoids
  downloading asset files while preserving their references for same-dataset
  restoration.
- If the work changes asset documents or references, or uploads, replaces, or
  deletes assets, create a full export including assets instead.
- Dataset deletion, project settings, access controls, and unrelated cleanup
  still require explicit approval.

## Fast verification

Ovi is the primary tester. Finish the implementation, then give him the exact
URL, viewport, state, and actions to check. Use his report as the visual verdict.
Use a browser or screenshots only when he explicitly asks.

During implementation, run only the smallest cheap check needed to catch a
syntax, type, or generated-code failure. Do not add tests merely because code
changed, and do not run broad test suites by default.

Add or run focused tests only when Ovi asks, or when the change involves:

- destructive data work;
- security or authorization;
- subtle pure logic that is hard to verify manually; or
- a regression that is expensive to reproduce.

`pnpm verify` is the release and pull-request gate. Do not run it while you
implement; run it one time before you open the pull request.

## Review agents

CodeRabbit is not opt-in. Route it with the budget and routing rule in the
user-level instructions, and run the route you pick without asking. One review
for each pull request, never two.

Review subagents, review skills, and adversarial review loops are different:
they burn context and time rather than money, and they stay explicit opt-in.
Do not invoke one unless Ovi asks for it in the current task.

## Repository scanning

Use `rg` or `git ls-files` for discovery. Exclude `.claude/worktrees/`,
`node_modules/`, `.next/`, `.sanity/`, `dist/`, `build/`, and `backups/` from
broad scans. If `find` is necessary, prune those paths explicitly.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`.

- Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `build`, `ci`.
- Scope is optional but preferred when the change is confined to one area — e.g. `feat(header):`, `fix(studio):`.
- Summary is imperative and lowercase: "add", not "added" or "Adds".
- Keep explaining *why* in the body. The prefix classifies the change; it does not replace the reasoning.
- Note that commits predating this rule use plain imperative subjects with no prefix. Follow the convention above, not the older style.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain-doc layout. See `docs/agents/domain.md`.

### Page rethink

`/page-draft <slug>` in Claude Code and `$page-draft` in ChatGPT/Codex
share `docs/agents/page-workflow.md`. Read it before drafting a page.
One writer creates content directly in Sanity, with proposed claims marked
and a client checklist on the Basecamp card. Ovi is the reviewer. Content
comes before layout; use existing sections and record development proposals
on the card. No schema/frontend work, GitHub plan, dedicated worktree, seed
file, or review agent belongs to content drafting. Code development is a
separate task. Avatars live in `docs/avatars.md`.

`/page-polish <slug>` and `$page-polish` share `docs/agents/page-polish.md`.
Read it before polishing a page in the Polish column: it publishes the
baseline, judges every section's fit with screenshots, fixes what the Page
Builder can fix, and reports layout proposals in chat only.

### Build flow

Before `/to-spec`, `/to-tickets`, `/implement`, or `/tdd` runs, read
`docs/agents/build-flow.md`. Its architectural flag, test policy, and closing
steps replace the ones written inside those skills. `/implement` does not run
the full suite while it works; it follows that file's closing steps and its
review sequence.

### Page Builder work

Before adding or changing a Page Builder section, its fields, or its stored
content shape, read `docs/agents/page-builder.md`.

### Sanity CLI

Always pass `SANITY_AUTH_TOKEN` from `studio/.env.local` when invoking the Sanity CLI. See `docs/agents/sanity-cli.md`.

### Raster image descriptions

New images get their searchable `description` from Raster's AI. After uploading
images to Sanity, upload the same files to a Raster library and run
`pnpm raster:sync --apply` (defaults to the library with the newest upload). See `docs/agents/raster-descriptions.md`.

### Development workflow

Before changing workspace dependencies, Sanity schemas, GROQ queries, or development scripts, consult the relevant section of `README.md`.
