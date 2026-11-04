-- Memorial card entries (#107): one row per memorial or honor card a donor
-- sends from /donate/memorial. Each form keeps its entries in its own table;
-- form_entries stays the "Ask about camp" table. The submission ID comes from
-- the Website, so the store task and the nightly gap-filler can insert the
-- same entry more than once and still keep one row.
create table memorial_card_entries (
  submission_id uuid primary key,
  received_at timestamptz not null,
  source text not null,
  page text not null,
  campaign text,
  -- 'memory' for "In memory of", 'honor' for "In honor of".
  tribute text not null check (tribute in ('memory', 'honor')),
  honoree_name text not null,
  -- Empty for a memorial gift, and when the donor names no occasion.
  occasion text not null default '',
  -- The office matches the card to the gift with it; the family never sees it.
  amount numeric(12, 2) not null check (amount > 0),
  give_by text not null check (give_by in ('online', 'check')),
  recipient_name text not null,
  recipient_street text not null,
  recipient_city text not null,
  recipient_state text not null,
  recipient_zip text not null,
  card_design text not null,
  card_message text not null,
  -- True when the donor wrote the words, false for a preset line.
  card_message_is_own_words boolean not null,
  donor_name text not null,
  donor_street text not null,
  donor_city text not null,
  donor_state text not null,
  donor_zip text not null,
  donor_phone text not null,
  donor_email text not null,
  formspark_id text unique,
  stored_at timestamptz not null default now()
);

-- Retention deletes by age.
create index memorial_card_entries_received_at on memorial_card_entries (received_at);

-- A delivery gap now belongs to an entry of either form, so it names its
-- form and no longer points at form_entries. Retention deletes a gap with
-- its entry: both carry the entry's received_at.
alter table delivery_gaps drop constraint delivery_gaps_submission_id_fkey;
alter table delivery_gaps add column form text not null default 'ask_about_camp'
  check (form in ('ask_about_camp', 'memorial_card'));
