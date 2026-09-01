create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  situation text not null check (char_length(situation) between 1 and 800),
  thought text not null check (char_length(thought) between 1 and 500),
  emotion text not null check (char_length(emotion) between 1 and 40),
  intensity smallint not null check (intensity between 1 and 10),
  reaction text not null check (char_length(reaction) between 1 and 500),
  ai_reflection jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood smallint not null check (mood between 1 and 5),
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  completed boolean not null default false,
  goal_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_created_idx on public.entries (user_id, created_at desc);
create index if not exists checkins_user_created_idx on public.checkins (user_id, created_at desc);
create index if not exists goals_user_date_idx on public.goals (user_id, goal_date desc);

do $$
declare table_name text;
begin
  foreach table_name in array array['entries','checkins','goals'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', table_name || '_select_own', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', table_name || '_insert_own', table_name);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', table_name || '_update_own', table_name);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', table_name || '_delete_own', table_name);
  end loop;
end $$;
