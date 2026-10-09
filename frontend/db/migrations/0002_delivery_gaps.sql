-- Delivery gaps (#52): requests that reached only one of the two paths. The
-- nightly gap-filler adds one row per gap; the dashboard counts them, and the
-- report email lists the rows it has not sent yet. A row holds no family
-- details, and it goes when retention deletes its entry.
create table delivery_gaps (
  submission_id uuid not null references form_entries on delete cascade,
  -- The path that failed: 'trigger' when the gap-filler had to copy the entry
  -- from Formspark, 'formspark' when Formspark has no copy of a Neon entry.
  path text not null check (path in ('trigger', 'formspark')),
  received_at timestamptz not null,
  found_at timestamptz not null,
  emailed_at timestamptz,
  primary key (submission_id, path)
);

-- The dashboard counts gaps by date range.
create index delivery_gaps_received_at on delivery_gaps (received_at);
