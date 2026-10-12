-- Call status (#80): what the office did with an "Ask about camp" request.
-- A new request waits for a call ('to_call'); the caller marks it 'called'
-- or 'no_answer' (try again) and may leave one short note. The columns live
-- with the entry, so the three-year retention deletes them with it.
alter table form_entries
  add column call_status text not null default 'to_call'
    check (call_status in ('to_call', 'called', 'no_answer')),
  add column call_note text not null default ''
    check (char_length(call_note) <= 500),
  -- The last status change; null until the first one.
  add column call_status_at timestamptz;
