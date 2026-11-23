-- MyHub: eine Tabelle, in der pro Nutzer alle Dashboard-Daten als JSON liegen.
create table public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
grant select, insert, update on public.user_data to authenticated;
create policy "eigene daten" on public.user_data
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
