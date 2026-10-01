# Canadian Adventure Camp

The production website and Sanity Studio for Canadian Adventure Camp.

## Local development

Requirements:

- Node.js 24.19.0
- pnpm 11.10.0
- The Canadian Adventure Camp Sanity project ID
- A Sanity API read token
- A Sanity auth token
- An available Studio hostname

Create local environment files, then add the required credentials:

```bash
install -m 600 frontend/.env.local.example frontend/.env.local
install -m 600 studio/.env.local.example studio/.env.local
```

The read token powers Sanity Presentation draft previews. The auth token powers Studio-side CLI jobs and repository-scoped Sanity MCP access in Codex. Claude Code reaches the Sanity MCP server over HTTP with OAuth instead (see `.mcp.json`): run `/mcp` once in an interactive `claude` session, pick `sanity`, and sign in; the token is stored per user and shared by every worktree. Add optional integration credentials to the local env files only when the matching feature needs them. The committed `.env.local.example` files list the supported names.
The Studio uses `studio/.env.local` for the local Website preview and the
committed `studio/.env.production` for the deployed Website preview and Studio
app ID.

Install dependencies and start both apps:

```bash
pnpm install
pnpm dev
```

- Website: `http://localhost:3000`
- Studio: `http://localhost:3333`

Before using Presentation, confirm the Website and Studio origins are present in the Sanity project's CORS settings.

## Workspace commands

```bash
pnpm dev
pnpm dev:frontend
pnpm dev:studio
pnpm dev:stop
pnpm deploy:studio
pnpm setup:sanity-cors
pnpm page-builder:new <name>
pnpm legacy:page <slug>
pnpm page:text <slug>
pnpm sanity:query '<groq>' ['<json params>']
pnpm page:seed <seed.mjs> [--apply]
pnpm sync:main
pnpm merge:refs <ref>...
pnpm verify
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm typegen
```

`pnpm dev:stop` lists every Next.js and Sanity dev server started from any
worktree of this repository, with port, memory, uptime, and worktree. Stop them
with `--all`, `--here` (this worktree), `--orphans` (launcher already gone), or
`--port <n>`. Stopping one server also stops its sibling and frees the slot.

Run `pnpm verify` before opening a pull request. It checks generated Sanity types, TypeScript, lint, focused tests, both production builds, and the smoke suite. GitHub Actions runs the same two halves, `pnpm verify:static` and `pnpm verify:build`, as parallel jobs under one `Release gate` check. A pull request that changes only documentation (`docs/`, Markdown files, `.claude/`, `.codex/`) skips both halves.

`pnpm page-builder:new <name>` creates and registers a typed Studio schema,
GROQ projection, and React renderer. Use `--scope content|general|home`,
`--title "Studio title"`, `--preview ./preview.jpg`, or `--dry-run` as needed.

`$page-draft` in ChatGPT/Codex and `/page-draft` in Claude Code write page
content directly through Sanity MCP and update the page's Basecamp card.
They reuse existing layouts and propose code changes for separate work.
See `docs/agents/page-workflow.md`. The legacy read and seed commands remain
available for other tasks; seeds are not part of page drafting.

`pnpm sync:main` and `pnpm merge:refs` support code development and regenerate
Sanity types while merging branches. Content-only work needs neither.

Use plain pnpm commands from the repository root. Add workspace dependencies with `pnpm --dir frontend add <package>` or `pnpm --dir studio add <package>`.

## Deployment

The Website and Studio deploy separately.

The Vercel project uses `frontend` as its root directory. Keep its environment values in sync with `frontend/.env.local.example`.

Deploy the Studio manually after confirming that `SANITY_STUDIO_PREVIEW_URL`
in `studio/.env.production` contains the deployed Website origin:

```bash
pnpm setup:sanity-cors
pnpm deploy:studio
```

The deployment command takes the preview origin and Studio app ID from
`studio/.env.production`, overriding values inherited from your terminal. It
loads the auth token from `studio/.env.local` and rejects local preview
addresses before it builds or uploads. Use this command for deployments;
calling `sanity deploy` directly bypasses these checks.

See `docs/deployment.md` for the production gate and complete deployment checklist.

## Repository layout

- `frontend/`: Next.js Website
- `studio/`: Sanity Studio, schemas, and functions
- `shared/`: code shared by both workspaces
- `docs/agents/`: repository workflow guidance

Read `docs/content-model.md` for the model map and `docs/agents/page-builder.md` before changing Page Builder sections.

## License

The repository is available under the MIT License.
