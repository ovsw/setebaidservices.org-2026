#!/bin/sh
# Starts the shadcn MCP server with the shadcnblocks key in its environment.
#
# T3 creates a worktree and starts the thread's MCP servers at the same time
# as "pnpm setup:worktree" copies the env files, so the server can come up
# before frontend/.env.local exists. The MCP server also does not load that
# file on its own. This wrapper reads the key from this checkout's file, or
# from the primary checkout's file when the copy is not there yet.
set -e

root="$(cd "$(dirname "$0")/.." && pwd)"
common_dir="$(git -C "$root" rev-parse --path-format=absolute --git-common-dir)"
primary="$(dirname "$common_dir")"

if [ -z "$SHADCNBLOCKS_API_KEY" ]; then
  for file in "$root/frontend/.env.local" "$primary/frontend/.env.local"; do
    if [ -f "$file" ]; then
      key="$(sed -n 's/^SHADCNBLOCKS_API_KEY=//p' "$file" | head -n 1 | tr -d '"'"'")"
      if [ -n "$key" ]; then
        SHADCNBLOCKS_API_KEY="$key"
        export SHADCNBLOCKS_API_KEY
        break
      fi
    fi
  done
fi

cd "$root/frontend"
exec npx -y shadcn@4.16.1 mcp
