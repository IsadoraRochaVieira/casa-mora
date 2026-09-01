create extension if not exists pgcrypto;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 3000),
  crisis boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_created_idx on public.messages (user_id, created_at desc);

alter table public.messages enable row level security;
revoke all on table public.messages from anon, authenticated;
grant select, insert, delete on table public.messages to authenticated;

create policy "messages_select_own" on public.messages for select to authenticated
using ((select auth.uid()) = user_id);

create policy "messages_insert_own" on public.messages for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "messages_delete_own" on public.messages for delete to authenticated
using ((select auth.uid()) = user_id);

comment on table public.messages is 'Mensagens privadas das conversas da Casa Mora, isoladas por usuário via RLS.';
