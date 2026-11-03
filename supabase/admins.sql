-- Las cuentas con estos emails quedan como administradoras apenas se crean
-- (Authentication → Users → Add user). Para sumar otra persona, agregá su email
-- a la lista y volvé a correr este archivo en el SQL Editor.
-- (El repo es público: reemplazá EMAIL_DE_PATRICIA solo en el SQL Editor, no acá.)

create or replace function public.admin_por_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(new.email) in ('EMAIL_DE_PATRICIA') then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists admin_por_email on auth.users;
create trigger admin_por_email after insert on auth.users
for each row execute function public.admin_por_email();

-- Por si la cuenta ya existía antes del disparador.
insert into public.admins (user_id)
select id from auth.users where lower(email) in ('EMAIL_DE_PATRICIA')
on conflict do nothing;
