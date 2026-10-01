# Build flow policy

This file applies when `/to-spec`, `/to-tickets`, `/implement`, or `/tdd`
runs in this repo. The rules here replace the closing steps and test steps
written inside those skills. The skills are shared across projects; this file
is where this project decides.

## Architectural flag

`/to-spec` and `/to-tickets` must mark every ticket, and every item in the
spec's Implementation Decisions, with one line:

`Architectural: yes|no — <reason>`

The test for **yes** lives in the user-level instructions, under code review
budget and routing. In this repository it reads as:

- It changes a stored shape: a Sanity schema, a Page Builder section's fields,
  or the shape a GROQ query returns.
- It adds, moves, or removes a seam that other code calls through.
- It adds a term to `CONTEXT.md`, or changes what an existing term means.
- It adds a dependency, or is the first instance of a pattern others will copy.
- If the implementer chose differently, other tickets would have to change.

The same flag routes the review. Flag it once, and it answers both questions.

When **yes**: the decision is made in the spec, and in an ADR if it is hard to
reverse. The ticket points at the decision; it does not make it.

During `/implement`: if the ticket needs an architectural choice that the spec
does not make, stop and ask. Do not pick.

## Test policy

Test logic, not looks.

- Write tests only for: destructive data work; security or authorization; pure
  logic that is hard to verify by eye (resolvers, transforms, GROQ shaping,
  migration scripts); a regression that is expensive to reproduce.
- Do not test layout, spacing, colour, copy, or that a component renders. Ovi
  verifies looks in the browser.
- The spec's Testing Decisions section names what is tested. Follow it. If the
  spec has no such section, apply the list above.
- `/tdd` drives only the tested slices. Build untested slices directly.

## Closing steps for `/implement`

The skill's own text says: run the full test suite, run `/code-review`, commit.
In this repo:

- Run the typecheck and the single test files you touched. Do not run
  `pnpm verify` or the full suite while you implement. Run `pnpm verify` one
  time before you open the pull request; it is the PR gate.
- Run the review that [Review policy](#review-policy) routes the ticket to.
  Judge the route yourself; do not ask Ovi to trigger it.
- Commit on the current branch. Then report: what changed, what was checked,
  and any open questions.

## PR architecture

One PR per ticket. Each ticket is a tracer bullet: it lands green on `main` by
itself. That is what lets the next `/implement` session start from `main` and
see the blocker's work, and what keeps each diff small enough to review in one
sitting.

- Branch from `main` for each ticket. Do not stack branches.
- The PR body says `Closes #<ticket>` and `Part of #<spec>`. The spec issue
  closes when its last ticket merges.
- Exception: tickets that cannot stay green alone (the wide-refactor case in
  `/to-tickets`) share one integration branch and one PR, gated by the final
  integrate-and-verify ticket.

## Review policy

The budget and the routing table are in the user-level instructions and apply
to every project. Read them there; they are not repeated here. You route the
ticket and run the review yourself, without waiting for Ovi.

Two things are specific to this repository:

- **Auto-review is off.** `.coderabbit.yaml` sets `auto_review.enabled: false`,
  so opening a PR starts nothing. A PR review means you post the
  `@coderabbitai review` comment on the PR yourself.
- **Why the split pays here.** Architectural tickets spend the PR quota so
  CodeRabbit sees the merged codebase and the GitHub thread stays as a record.
  Other logic spends the CLI quota, so fixes land in the session that wrote the
  code. Looks-only tickets get Ovi's eyes, which is the only review that works
  for them.

Sequence in the implementing session: `/implement` → commit → CLI review if
the table says so → fix → `/theo-file-pr` → PR review if the table says so →
`/autofix` → merge.
