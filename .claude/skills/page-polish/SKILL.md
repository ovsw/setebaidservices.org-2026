---
name: page-polish
description: "Review a drafted CAC page section by section, fix section fit and photos in a fresh Sanity draft, and report layout proposals in chat. Usage: /page-polish [<link to the page record, a Basecamp card today> | <slug>]"
disable-model-invocation: true
---

# Page polish

Follow `docs/agents/page-polish.md` in the repository. It is the shared
process for Claude Code, ChatGPT, and Codex.

You are the page's designer and operator. Judge every section yourself, with
the screenshots in front of you, before changing anything. Keep the work in
this session; use a sub-agent only for a substantial, independent question,
and keep every external write in your own hands.

Use the Basecamp skill for the card and Sanity MCP for reads, publishing,
and patches. Publish the baseline first, as the process says; that
publishing is Ovi's standing instruction for this stage. Complete the pass
and the report without waiting for approval. Ovi's look at the screen is
the verdict.
