-- The Neon store of spec #43: form entries, daily totals and job state.

-- One row per "Ask about camp" request. The submission ID comes from the
-- Website, so the store task and the nightly gap-filler can insert the same
-- entry more than once and still keep one row.
create table form_entries (
  submission_id uuid primary key,
  received_at timestamptz not null,
  source text not null,
  page text not null,
  campaign text,
  parent_name text not null,
  phone text not null,
  email text not null,
  child_age text not null,
  best_time text not null default '',
  interests text[] not null default '{}',
  formspark_id text unique,
  stored_at timestamptz not null default now()
);

-- The dashboard counts requests by date range; retention deletes by age.
create index form_entries_received_at on form_entries (received_at);

-- Visit and tap counts copied from Vercel Web Analytics, one row per day,
-- Source, page and metric.
create table daily_totals (
  day date not null,
  source text not null,
  page text not null,
  metric text not null
    check (metric in ('visits', 'scans', 'call_taps', 'email_taps', 'form_requests')),
  count integer not null check (count >= 0),
  primary key (day, source, page, metric)
);

-- The time of the last successful run of each job, for "Last updated".
create table job_state (
  job text primary key,
  last_success_at timestamptz not null
);
