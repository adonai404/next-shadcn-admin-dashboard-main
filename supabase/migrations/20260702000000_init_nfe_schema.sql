-- Baseline migration documenting the NF-e analysis schema (empresas, notas, itens)
-- as it already exists on the linked Supabase project (euwmoykfltkbkzcedsvy).
-- This file is recorded as already applied (see supabase_migrations.schema_migrations)
-- because the tables were originally created by hand via the SQL editor.
--
-- Row shapes match src/app/(main)/dashboard/nfe-analysis/_lib/db.ts

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- empresas
-- ---------------------------------------------------------------------------
create table public.empresas (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome       text not null,
  cnpj       text not null,
  criado_em  timestamptz not null default now(),
  constraint empresas_owner_id_cnpj_key unique (owner_id, cnpj)
);

alter table public.empresas enable row level security;

create policy "empresas_select_own" on public.empresas
  for select using (owner_id = auth.uid());
create policy "empresas_insert_own" on public.empresas
  for insert with check (owner_id = auth.uid());
create policy "empresas_update_own" on public.empresas
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "empresas_delete_own" on public.empresas
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- notas
-- ---------------------------------------------------------------------------
create table public.notas (
  chave           text primary key,
  owner_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  empresa_id      uuid not null references public.empresas (id) on delete cascade,
  tipo            text not null check (tipo in ('nfe_recebida', 'nfe_emitida', 'nfce')),
  mod             text not null check (mod in ('55', '65')),
  numero          text not null,
  serie           text not null,
  dh_emi          text not null,
  nat_op          text not null,
  emitente        jsonb not null,
  destinatario    jsonb,
  valores         jsonb not null,
  pagamentos      jsonb not null default '[]'::jsonb,
  arquivo_origem  text not null,
  importado_em    timestamptz not null default now()
);

create index notas_empresa_id_idx on public.notas (empresa_id);
create index notas_owner_id_idx on public.notas (owner_id);

alter table public.notas enable row level security;

create policy "notas_select_own" on public.notas
  for select using (owner_id = auth.uid());
create policy "notas_insert_own" on public.notas
  for insert with check (owner_id = auth.uid());
create policy "notas_update_own" on public.notas
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "notas_delete_own" on public.notas
  for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- itens
-- ---------------------------------------------------------------------------
create table public.itens (
  id          text primary key,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nota_chave  text not null references public.notas (chave) on delete cascade,
  c_prod      text not null,
  x_prod      text not null,
  ncm         text not null,
  cfop        text not null,
  u_com       text not null,
  q_com       numeric not null,
  v_un_com    numeric not null,
  v_prod      numeric not null,
  v_desc      numeric not null default 0,
  impostos    jsonb not null
);

create index itens_nota_chave_idx on public.itens (nota_chave);
create index itens_owner_id_idx on public.itens (owner_id);

alter table public.itens enable row level security;

create policy "itens_select_own" on public.itens
  for select using (owner_id = auth.uid());
create policy "itens_insert_own" on public.itens
  for insert with check (owner_id = auth.uid());
create policy "itens_update_own" on public.itens
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "itens_delete_own" on public.itens
  for delete using (owner_id = auth.uid());
