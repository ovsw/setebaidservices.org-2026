-- Parent's guide requests: one row per parent who asks for the guide on
-- /parents/guide, with only a name and an email. Each form keeps its entries
-- in its own table. The submission ID comes from the Website, so the store
-- task and the nightly gap-filler can insert the same entry more than once
-- and still keep one row.
create table parents_guide_entries (
  submission_id uuid primary key,
  received_at timestamptz not null,
  source text not null,
  page text not null,
  campaign text,
  parent_name text not null,
  email text not null,
  formspark_id text unique,
  stored_at timestamptz not null default now()
);

-- Retention deletes by age.
create index parents_guide_entries_received_at on parents_guide_entries (received_at);

-- A delivery gap can now belong to a parent's guide request too.
alter table delivery_gaps drop constraint delivery_gaps_form_check;
alter table delivery_gaps add constraint delivery_gaps_form_check
  check (form in ('ask_about_camp', 'memorial_card', 'parents_guide'));
