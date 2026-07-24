-- P3.1 (edit) — let a household owner remove other members, not just self.
-- Rename uses the existing member UPDATE policy; delete uses the existing
-- created_by DELETE policy on households.

create or replace function public.is_household_owner(hid uuid)
returns boolean language sql security definer set search_path = '' stable as $fn$
  select exists (
    select 1 from public.households h where h.id = hid and h.created_by = auth.uid()
  );
$fn$;

drop policy if exists "leave household" on public.household_members;
drop policy if exists "leave or remove members" on public.household_members;
create policy "leave or remove members" on public.household_members for delete
  using (user_id = auth.uid() or public.is_household_owner(household_id));
