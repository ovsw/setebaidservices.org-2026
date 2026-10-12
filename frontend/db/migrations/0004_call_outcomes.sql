-- Call outcomes (#80): "Called" said nothing about the result of the call.
-- It splits into the outcomes below. Open statuses keep a request on the
-- call list; closed ones end it. A request still marked 'called' becomes
-- 'follow_up', the open status closest to it.
alter table form_entries drop constraint form_entries_call_status_check;

update form_entries set call_status = 'follow_up' where call_status = 'called';

alter table form_entries add constraint form_entries_call_status_check
  check (call_status in (
    -- open
    'to_call', 'no_answer', 'left_message', 'follow_up',
    -- closed
    'plans_to_register', 'not_for_them', 'cant_reach'
  ));
