-- Esquema inicial para BRE Biobío en Supabase (PostgreSQL)

-- 1. Tabla de perfiles vinculada a auth.users
create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rut text unique,
  nombre_completo text,
  rol text not null default 'postulante'
    check (rol in ('superadmin', 'director', 'voluntario', 'postulante')),
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.perfiles enable row level security;

create policy "Usuarios autenticados pueden ver su propio perfil"
  on public.perfiles for select
  using (auth.uid() = id);

create policy "Lectura pública de perfiles activos para ficha"
  on public.perfiles for select
  using (activo = true);

create policy "Directores y superadmin pueden ver todos los perfiles"
  on public.perfiles for select
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('director', 'superadmin')
    )
  );

create policy "Directores y superadmin pueden actualizar roles de perfiles"
  on public.perfiles for update
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('director', 'superadmin')
    )
  );

-- Trigger para crear el perfil automáticamente al registrarse en Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre_completo, rut, rol)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nombre_completo',
    new.raw_user_meta_data ->> 'rut',
    coalesce(new.raw_user_meta_data ->> 'rol', 'postulante')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabla de certificados de voluntarios
create table if not exists public.certificados (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  titulo_curso text not null,
  institucion text,
  fecha_emision date,
  archivo_url text,
  estado_validacion text not null default 'pendiente'
    check (estado_validacion in ('pendiente', 'aprobado', 'rechazado')),
  creado_en timestamptz not null default now()
);

alter table public.certificados enable row level security;

create policy "Lectura pública de certificados aprobados"
  on public.certificados for select
  using (estado_validacion = 'aprobado' or auth.uid() = perfil_id);

create policy "Voluntarios pueden subir sus propios certificados"
  on public.certificados for insert
  with check (auth.uid() = perfil_id);

create policy "Directores y superadmin pueden validar certificados"
  on public.certificados for update
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('director', 'superadmin')
    )
  );

-- 3. Tabla de operativos de emergencia
create table if not exists public.operativos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  estado text not null default 'en_curso'
    check (estado in ('pendiente', 'en_curso', 'finalizado')),
  latitud double precision,
  longitud double precision,
  creado_por uuid references public.perfiles (id),
  creado_en timestamptz not null default now()
);

alter table public.operativos enable row level security;

create policy "Personal autenticado puede ver operativos"
  on public.operativos for select
  using (auth.role() = 'authenticated');

create policy "Directores y superadmin pueden gestionar operativos"
  on public.operativos for all
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('director', 'superadmin')
    )
  );

-- 4. Tabla de inventario logístico
create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text,
  cantidad integer not null default 1,
  estado text not null default 'Operativo'
    check (estado in ('Operativo', 'En mantención', 'De baja')),
  updated_at timestamptz not null default now()
);

alter table public.inventario enable row level security;

create policy "Directores y superadmin gestionan inventario"
  on public.inventario for all
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('director', 'superadmin')
    )
  );

-- 5. Tabla de solicitudes de apoyo (formulario público)
create table if not exists public.solicitudes_apoyo (
  id uuid primary key default gen_random_uuid(),
  solicitante text not null,
  telefono text not null,
  email text not null,
  tipo_apoyo text not null,
  descripcion text not null,
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'En revisión', 'Atendida')),
  created_at timestamptz not null default now()
);

alter table public.solicitudes_apoyo enable row level security;

create policy "Cualquiera puede enviar una solicitud de apoyo"
  on public.solicitudes_apoyo for insert
  with check (true);

create policy "Directores y superadmin pueden ver solicitudes"
  on public.solicitudes_apoyo for select
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('director', 'superadmin')
    )
  );

create policy "Directores y superadmin pueden actualizar solicitudes"
  on public.solicitudes_apoyo for update
  using (
    exists (
      select 1 from public.perfiles p
      where p.id = auth.uid() and p.rol in ('director', 'superadmin')
    )
  );


