# Before the code bootstrap

Material made from 2026-09-24 to 2026-10-01, before this repository got its
Website and Studio code (copied from the Canadian Adventure Camp 2026 code
base, see issue #1). Kept for reference. Nothing here is live code.

- `assets-old/`: the old Setebaid logos and the photos from the current site.
- `build/`: pages built from the ProcessWire export, and the Miro sync data.
- `scripts/`: the scripts that converted the export and synced it to Miro.
- `design/`: the home page brief.
- `old-tooling/`: the agent setup from before the bootstrap (agent docs,
  skills, the old `.gitignore`). The root versions replaced it.

The ProcessWire export (`source/`) is not in git. It holds user accounts,
password hashes and private emails, so it stays only on Ovi's machine. The root
`.gitignore` keeps it out.

`PRODUCT.md` and `.impeccable/` stay at the repository root, because the
Impeccable design tool reads them from there.
