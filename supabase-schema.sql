-- =====================================================================
-- Esquema do banco para o app "Minhas Compras"
-- Rode isto no Supabase: Dashboard → SQL Editor → New query → Run
-- =====================================================================

-- Guarda TODO o estado do app como um documento JSON, por conta (= por casal).
-- Modelo "last-write-wins": a última gravação vence (simples e suficiente,
-- já que vocês raramente editam ao mesmo tempo).
create table if not exists public.app_state (
  id          uuid primary key references auth.users(id) on delete cascade,
  data        jsonb       not null default '{}',
  updated_at  timestamptz not null default now()
);

-- Segurança em nível de linha: cada usuário só enxerga/edita a própria linha.
alter table public.app_state enable row level security;

drop policy if exists "select own state" on public.app_state;
create policy "select own state" on public.app_state
  for select using (auth.uid() = id);

drop policy if exists "insert own state" on public.app_state;
create policy "insert own state" on public.app_state
  for insert with check (auth.uid() = id);

drop policy if exists "update own state" on public.app_state;
create policy "update own state" on public.app_state
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Habilita atualização em tempo real (o outro celular recebe na hora).
alter publication supabase_realtime add table public.app_state;
