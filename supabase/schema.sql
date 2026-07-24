-- Esquema de futreg_app para Supabase.
-- Ejecutar entero en el SQL Editor del proyecto (Supabase Studio > SQL Editor > New query).
-- Es idempotente: se puede volver a ejecutar sin romper nada.

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

-- Plantilla. Un jugador pertenece siempre a un usuario.
-- "local_id" es el id numerico estable que usa el cliente (Player.id), lo que
-- permite hacer upsert sin tener que arrastrar el uuid en el navegador.
-- "numero" es el dorsal; "x"/"y" son la posicion en el campo en porcentaje (0-100).
create table if not exists public.players (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  local_id    integer not null,
  numero      integer not null default 0,
  name        text   not null default '',
  x           real   not null default 50,
  y           real   not null default 50,
  photo_path  text,
  created_at  timestamptz not null default now(),
  constraint players_user_local_unique unique (user_id, local_id)
);

-- Un partido. "phase" replica el tipo Phase del cliente ('pre'|'1H'|'ht'|'2H'|'ft'|'end').
create table if not exists public.matches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  match_date  date   not null default current_date,
  local       text   not null default '',
  visitante   text   not null default '',
  phase       text   not null default 'pre',
  seconds     integer not null default 0,
  half        smallint not null default 1,
  finished_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint matches_half_check  check (half in (1, 2)),
  constraint matches_phase_check check (phase in ('pre', '1H', 'ht', '2H', 'ft', 'end'))
);

-- Acciones del partido. "client_id" es el id numerico que genera el cliente
-- (Date.now()); lo guardamos para poder hacer upsert idempotente desde el
-- navegador sin tener que esperar al id que asigna la base de datos.
create table if not exists public.actions (
  id            uuid primary key default gen_random_uuid(),
  match_id      uuid not null references public.matches (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  client_id     bigint not null,
  type          text   not null,
  seconds       integer not null default 0,
  player        jsonb,
  assist_player jsonb,
  point         jsonb,
  drag          jsonb,
  goal_point    jsonb,
  goal_drag     jsonb,
  duel_result   text,
  shot_type     text,
  note          text not null default '',
  created_at    timestamptz not null default now(),
  constraint actions_type_check check (type in ('gol', 'ocasion', 'tiro', 'falta')),
  constraint actions_duel_result_check check (duel_result is null or duel_result in ('ganado', 'perdido')),
  constraint actions_shot_type_check check (shot_type is null or shot_type in ('tiro', '1v1', 'pie', 'cabeza')),
  -- Reintentar el guardado de la misma accion no la duplica.
  constraint actions_match_client_unique unique (match_id, client_id)
);

create index if not exists players_user_idx  on public.players (user_id);
create index if not exists matches_user_idx  on public.matches (user_id, match_date desc);
create index if not exists actions_match_idx on public.actions (match_id, seconds);

-- ---------------------------------------------------------------------------
-- updated_at automatico en matches
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists matches_touch_updated_at on public.matches;
create trigger matches_touch_updated_at
  before update on public.matches
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: cada usuario solo ve y escribe lo suyo.
-- Sin estas politicas la anon key (que viaja en el bundle del navegador)
-- daria acceso a todos los datos de todos los usuarios.
-- ---------------------------------------------------------------------------

alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.actions enable row level security;

drop policy if exists players_owner on public.players;
create policy players_owner on public.players
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists matches_owner on public.matches;
create policy matches_owner on public.matches
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists actions_owner on public.actions;
create policy actions_owner on public.actions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage para las fotos de jugadores.
-- Bucket privado: se sirven con URLs firmadas de duracion limitada.
-- La convencion de ruta es "<user_id>/<player_id>.<ext>", y la politica
-- comprueba que la primera carpeta sea el uid de quien pide.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', false)
on conflict (id) do nothing;

drop policy if exists player_photos_owner on storage.objects;
create policy player_photos_owner on storage.objects
  for all to authenticated
  using (bucket_id = 'player-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'player-photos' and (storage.foldername(name))[1] = auth.uid()::text);
