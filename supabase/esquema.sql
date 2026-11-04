-- Esquema de la tienda. Pegalo entero en Supabase → SQL Editor → Run.
-- Se puede correr más de una vez sin romper nada.

-- Quién puede editar: los usuarios cargados en esta tabla.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Datos generales de la tienda (una sola fila).
create table if not exists public.tienda (
  id int primary key default 1 check (id = 1),
  nombre text not null default '[Nombre de la tienda]',
  duena text not null default 'Patricia Camargo',
  whatsapp text not null default '',
  zona text not null default '[TU ZONA]',
  pagos text not null default '[MÉTODOS]',
  sobre text not null default 'Vendo productos Natura y blanquería para la casa: sábanas, toallas y más. Te ayudo a encontrar el perfume, el juego de cama o el regalo justo.',
  actualizado timestamptz not null default now()
);
insert into public.tienda (id) values (1) on conflict (id) do nothing;

alter table public.tienda enable row level security;
drop policy if exists "tienda: lectura pública" on public.tienda;
create policy "tienda: lectura pública" on public.tienda for select using (true);
drop policy if exists "tienda: admin edita" on public.tienda;
create policy "tienda: admin edita" on public.tienda for update using (public.es_admin()) with check (public.es_admin());

-- Productos.
create table if not exists public.productos (
  id uuid primary key default gen_random_uuid(),
  cat text not null,
  linea text not null default '',
  nombre text not null,
  descripcion text not null default '',
  tamano text not null default '',
  precio numeric(12, 2) check (precio is null or precio >= 0),
  pronta_entrega boolean not null default false,
  color text not null default 'plum',
  foto_url text,
  orden int not null default 100,
  activo boolean not null default true,
  creado timestamptz not null default now()
);

-- Categorías válidas (se redefine para poder sumar categorías nuevas).
alter table public.productos drop constraint if exists productos_cat_check;
alter table public.productos add constraint productos_cat_check
  check (cat in ('perfumes', 'cuidado', 'sabanas', 'toallas', 'hogar', 'ropa_interior', 'otros'));

alter table public.productos enable row level security;
drop policy if exists "productos: lectura pública" on public.productos;
create policy "productos: lectura pública" on public.productos for select using (activo or public.es_admin());
drop policy if exists "productos: admin agrega" on public.productos;
create policy "productos: admin agrega" on public.productos for insert with check (public.es_admin());
drop policy if exists "productos: admin edita" on public.productos;
create policy "productos: admin edita" on public.productos for update using (public.es_admin()) with check (public.es_admin());
drop policy if exists "productos: admin borra" on public.productos;
create policy "productos: admin borra" on public.productos for delete using (public.es_admin());

-- Fotos de productos (carpeta pública para ver, solo admin sube o borra).
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos: admin sube" on storage.objects;
create policy "fotos: admin sube" on storage.objects for insert to authenticated with check (bucket_id = 'fotos' and public.es_admin());
drop policy if exists "fotos: admin cambia" on storage.objects;
create policy "fotos: admin cambia" on storage.objects for update to authenticated using (bucket_id = 'fotos' and public.es_admin());
drop policy if exists "fotos: admin borra" on storage.objects;
create policy "fotos: admin borra" on storage.objects for delete to authenticated using (bucket_id = 'fotos' and public.es_admin());

-- Productos de ejemplo (solo si la tabla está vacía).
insert into public.productos (cat, linea, nombre, descripcion, tamano, pronta_entrega, color, orden)
select * from (values
  ('perfumes', 'Natura · Essencial', 'Essencial Desejos', 'Deo parfum femenino, edición festiva', '100 ml', true, 'plum', 10),
  ('perfumes', 'Natura · Essencial', 'Essencial Exclusivo Floral', 'Deo parfum femenino', '100 ml', true, 'ivory', 20),
  ('perfumes', 'Natura · Essencial', 'Essencial Oud', 'Deo parfum masculino', '100 ml', false, 'ink', 30),
  ('perfumes', 'Natura · Kaiak', 'Kaiak Clásico', 'Deo colonia masculina', '100 ml', false, 'sea', 40),
  ('perfumes', 'Natura · Luna', 'Luna Radiante', 'Deo parfum femenino', '75 ml', false, 'rose', 50),
  ('cuidado', 'Natura · Tododia', 'Tododia Frambuesa y Pimienta Rosa', 'Crema nutritiva corporal', '400 ml', false, 'berry', 60),
  ('cuidado', 'Natura · Ekos', 'Ekos Maracuyá', 'Aceite trifásico corporal', '200 ml', false, 'amber', 70),
  ('cuidado', 'Natura · Chronos', 'Chronos Antiseñales', 'Crema facial de día', '40 g', false, 'sand', 80),
  ('sabanas', 'Blanquería · Sábanas', 'Juego de sábanas 2 plazas', '[Material / hilos]', 'Sábana, bajera y 2 fundas', true, 'white', 90),
  ('sabanas', 'Blanquería · Sábanas', 'Juego de sábanas 1 plaza', '[Material / hilos]', 'Sábana, bajera y funda', false, 'blue', 100),
  ('toallas', 'Blanquería · Toallas', 'Juego toalla y toallón', '[Material / gramaje]', '[Medidas]', true, 'sage', 110),
  ('toallas', 'Blanquería · Toallas', 'Set de toallas de mano', '[Material]', '[Cantidad y medidas]', false, 'clay', 120),
  ('hogar', 'Blanquería · Hogar', 'Acolchado 2 plazas', '[Relleno / tela]', '[Medidas]', false, 'plum', 130),
  ('hogar', 'Blanquería · Hogar', 'Manta', '[Material]', '[Medidas]', false, 'grey', 140),
  ('ropa_interior', 'Ropa interior', 'Conjunto corpiño y bombacha', '[Material]', 'Talles [S a XL]', true, 'rose', 150),
  ('ropa_interior', 'Ropa interior', 'Pack de bombachas x3', '[Material]', 'Talles [S a XL]', false, 'nude', 160)
) as v
where not exists (select 1 from public.productos);

-- Después de crear el usuario de Patricia (Authentication → Users → Add user),
-- corré esto con su email para darle permiso de editar:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'EMAIL_DE_PATRICIA'
-- on conflict do nothing;
