---
name: page-draft
description: "Write one CAC page as a Sanity content draft. Usage: /page-draft [<slug> | <old-site URL> | <Basecamp card URL>]"
disable-model-invocation: true
---

# Page draft

Follow `docs/agents/page-workflow.md` in the repository. It is the shared
process for Claude Code, ChatGPT, and Codex.

You are the page's writer and operator. Keep composition in this session.
Use sub-agents only for substantial, independent research questions when
useful. Give each researcher its question and request a concise answer in
the conversation. Researchers are read-only; you own all external writes.

Use the available Basecamp skill and call Sanity MCP from this main session.
This process runs directly from the skill, without a dynamic build workflow.
Complete the draft and handover without waiting for editorial approval.
Ovi reviews the copy afterward.
