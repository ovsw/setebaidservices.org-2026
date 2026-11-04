-- Memorial card entries (#107). A second form sends its entries the same two
-- ways as "Ask about camp", so form_entries holds both kinds: the shared
-- columns (ID, time, Source, page, campaign, Formspark copy) for every
-- entry, and the "Ask about camp" answers only for that kind. The memorial
-- card answers live in their own table, one row per memorial entry. It is
-- deleted with its entry, so the three-year retention and the delivery gap
-- checks treat both kinds the same.
alter table form_entries
  add column kind text not null default 'ask_about_camp'
    check (kind in ('ask_about_camp', 'memorial_card')),
  alter column parent_name drop not null,
  alter column phone drop not null,
  alter column email drop not null,
  alter column child_age drop not null;

alter table form_entries add constraint form_entries_ask_about_camp_answers
  check (
    kind <> 'ask_about_camp'
    or (parent_name is not null and phone is not null and email is not null and child_age is not null)
  );

create table memorial_card_entries (
  submission_id uuid primary key references form_entries on delete cascade,
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
  donor_email text not null
);
