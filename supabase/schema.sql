-- Rode no SQL Editor do Supabase. Login por link no e-mail (Authentication > Providers > Email).
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 24),
  code text not null,                      -- código da partida (modo, cenário, semente)
  dec jsonb not null,                      -- registro de decisões; o ranking reexecuta para verificar
  score numeric not null,                  -- pontuação declarada (o site mostra a verificada)
  months int not null check (months between 12 and 600),
  created_at timestamptz not null default now(),
  unique (user_id, code)
);
alter table public.scores enable row level security;
create policy "ler ranking"        on public.scores for select using (true);
create policy "enviar o próprio"   on public.scores for insert with check (auth.uid() = user_id);
create policy "melhorar o próprio" on public.scores for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "apagar o próprio"   on public.scores for delete using (auth.uid() = user_id);
create index on public.scores (code, score desc);
