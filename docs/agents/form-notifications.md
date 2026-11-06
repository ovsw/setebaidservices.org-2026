# Form notifications

Every Website form has two emails, both sent by Formspark:

- The **office notification** goes to the form's notification recipients. It
  says what happened, what the office does next, and what the visitor sent.
- The **reply email** goes to the visitor right after they send the form. It
  says what happens next and promises only what Setebaid already does.

Both are code in `frontend/emails/`, and `pnpm form-emails` writes them to
Formspark through its template API.

## The one rule

Never edit these templates in Formspark's visual editor or in Postcraft. The
next push overwrites the change, and a code template cannot be opened in the
visual editor. Change the code here and push it.

## Where things are

- `frontend/emails/layout.ts`: the shared theme (Setebaid cream page, ink
  text, camp-green button, a system font, no images, at most 600px wide) and
  the two layouts.
- `frontend/emails/<form>.ts`: one file per form: its office notification,
  its reply email with the subject, and an example entry for the preview. A
  form whose reply email waits on something leaves `reply` out, and the
  script then pushes only its office notification.
- `frontend/emails/index.ts`: the list of forms the script handles.
- `frontend/scripts/form-emails.ts`: the script.

The placeholders are Handlebars, and the entry is under `data`, so a payload
field `phone` is `{{data.phone}}`. The field names are the ones
`frontend/lib/formspark-entry.ts` sends; a renamed payload field needs the
template changed with it. An optional answer row sets `onlyWhenGiven`, so it
shows only when the visitor filled the field in (the Website sends "—" for an
empty one). Formspark's helpers are `capitalize`, `nl2br`, `pluralize`,
`sanitizeUrl`, `stringify`, `switch`/`case`/`default` and `titleCase`; it has
no `eq`. Style only with inline `style` attributes: Formspark
sends no stylesheet.

## The layouts

The office notification has the same order for every form:

1. A heading that says what happened.
2. One line on what to do next.
3. The answers in form order, with plain labels, not field names.
4. One action button, only when there is one clear action.
5. Small print: Source, page, campaign, and the sent time in Pennsylvania time
   (`sent_at`, for example "Nov 5, 2026, 10:30 AM ET", which the Website
   sends ready to show), then "View in Formspark" when Formspark gives the
   link (`viewLink`).

The office notification sets no subject: the `_email.subject` the Website
sends wins over a template subject, so subjects stay in
`frontend/lib/formspark-entry.ts`.

The reply email greets the visitor, says what happens next, and is signed "The
Setebaid team". Its subject is in its form's file. Formspark sends it to the
first of `_replyto`, `mail` or `email` in the entry, adds a footer that cannot
be removed, and sends replies to the form's first notification recipient.

## Running the script

The script reads `FORMSPARK_TEMPLATE_TOKEN` (a Formspark token with
`forms:read` and `forms:write`) and the form IDs (`FORMSPARK_FORM_ID` for "Ask
about camp", `FORMSPARK_PARENTS_GUIDE_FORM_ID` for "Parent's guide") from `~/.config/setebaid/qr-mechanism.env`, the file
`pnpm db:migrate` reads. The token lives only on Ovi's machine, never in Vercel.

```sh
pnpm form-emails push                     # write every template to Formspark
pnpm form-emails preview                  # render every stored template; sends nothing
pnpm form-emails push "Ask about camp"    # one form only
```

- `push` writes each template. When Formspark answers `template_invalid`, the
  script stops and names the template; Formspark keeps the old one. It also
  stops when Formspark pauses a template.
- `preview` renders each template against its example entry and prints the
  subject and the text. Formspark previews only the template it stores, so
  preview after a push; it says when the stored template differs from the
  code.

Back up a template before its first push replaces a visual one
(`GET /forms/<id>/templates/<kind>`). After a push, Ovi checks the real emails
in Formspark with a test entry.
