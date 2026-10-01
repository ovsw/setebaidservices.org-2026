# Sanity CLI

For Studio deployment, use the guarded command. It loads the auth token from
`studio/.env.local` and forces the preview origin and Studio app ID from
`studio/.env.production`, overriding inherited terminal values:

```bash
pnpm deploy:studio
```

The guard rejects local preview addresses before build or upload. Calling
`sanity deploy` directly bypasses it. See `docs/deployment.md` for details.

The current Sanity CLI also loads `studio/.env.local` for direct commands. Run
them from the Studio workspace so it can resolve the correct environment:

```bash
pnpm --dir studio exec sanity <command>
```

Use direct CLI commands for operations such as `dataset import`, `dataset export`, and `schema extract`. Use the guarded command above for deployment.

To read documents, skip the CLI: `pnpm sanity:query '<groq>' ['<json params>']` prints the result as JSON, includes drafts, and loads the token itself.

## Notes

- Tokens are project-scoped. If the project ID changes, generate a new token at `https://www.sanity.io/manage/project/<projectId>/api#tokens` and update `studio/.env.local`.
- Required draft content writes have standing permission under AGENTS.md.
  Verify the target and backup before writing. Page drafting uses Sanity MCP
  for content mutations; the CLI supplies the verified recovery export.
  Dataset deletion, access changes, and unrelated cleanup require approval.
