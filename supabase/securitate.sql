-- =====================================================================
-- Acredit – securitate: aprobarea spitalelor noi + autentificare în doi pași
-- Rulează O SINGURĂ DATĂ în Supabase: SQL Editor → New query → lipește → Run.
-- (Poate fi rulat din nou fără probleme.)
--
-- 1. Spitalele au un status: „aprobat”, „în așteptare” sau „suspendat”.
--    Spitalele existente rămân aprobate. Cele noi așteaptă aprobarea
--    administratorului platformei și, până atunci, nu pot lucra în aplicație.
-- 2. Cine și-a activat autentificarea în doi pași primește acces la datele
--    spitalului DOAR după ce a introdus și codul din aplicația de autentificare.
--    Regula e impusă în baza de date, nu doar în paginile aplicației.
-- =====================================================================

begin;

-- 1. Statusul spitalului --------------------------------------------------
alter table public.hospitals
  add column if not exists status text not null default 'aprobat';
alter table public.hospitals drop constraint if exists hospitals_status_check;
alter table public.hospitals
  add constraint hospitals_status_check check (status in ('in_asteptare', 'aprobat', 'suspendat'));
alter table public.hospitals alter column status set default 'in_asteptare';
alter table public.hospitals add column if not exists status_changed_at timestamptz;

-- 2. Autentificarea în doi pași -------------------------------------------
-- Adevărat dacă utilizatorul NU are autentificare în doi pași activă,
-- sau o are și a introdus codul în această sesiune (nivel „aal2”).
create or replace function public.mfa_ok()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'aal', 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified');
$$;

-- Membru al spitalului, indiferent de statusul spitalului (pentru a-și vedea statusul).
create or replace function public.is_member_any(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where hospital_id = hid and user_id = auth.uid());
$$;

-- Acces la datele spitalului: membru + spital aprobat + al doilea pas trecut.
create or replace function public.is_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.mfa_ok() and exists (
    select 1 from public.memberships m join public.hospitals h on h.id = m.hospital_id
    where m.hospital_id = hid and m.user_id = auth.uid() and h.status = 'aprobat');
$$;

create or replace function public.can_edit(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.mfa_ok() and exists (
    select 1 from public.memberships m join public.hospitals h on h.id = m.hospital_id
    where m.hospital_id = hid and m.user_id = auth.uid() and m.role in ('admin', 'editor') and h.status = 'aprobat');
$$;

create or replace function public.is_admin(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.mfa_ok() and exists (
    select 1 from public.memberships m join public.hospitals h on h.id = m.hospital_id
    where m.hospital_id = hid and m.user_id = auth.uid() and m.role = 'admin' and h.status = 'aprobat');
$$;

-- Administratorul platformei: dacă are autentificare în doi pași, trebuie să fi trecut de ea.
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.mfa_ok() and exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

-- Membrii își văd spitalul și colegii chiar dacă spitalul așteaptă aprobarea.
drop policy if exists hospitals_select on public.hospitals;
create policy hospitals_select on public.hospitals for select using (public.is_member_any(id));
drop policy if exists memberships_select on public.memberships;
create policy memberships_select on public.memberships for select using (public.is_member_any(hospital_id));

-- Un spital creat de administratorul platformei e aprobat direct; celelalte așteaptă.
create or replace function public.create_hospital(p_name text, p_full_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'Neautentificat'; end if;
  if exists (select 1 from public.memberships where user_id = auth.uid()) then
    raise exception 'Contul aparține deja unui spital';
  end if;
  insert into public.hospitals (name, status)
    values (trim(p_name),
            case when exists (select 1 from public.platform_admins where user_id = auth.uid())
                 then 'aprobat' else 'in_asteptare' end)
    returning id into hid;
  insert into public.memberships (hospital_id, user_id, role, full_name, email)
    values (hid, auth.uid(), 'admin', nullif(trim(p_full_name), ''), auth.email());
  insert into public.activity_log (hospital_id, user_id, action, details)
    values (hid, auth.uid(), 'spital_creat', trim(p_name));
  return hid;
end $$;

-- Aprobare / suspendare din panoul de administrare.
create or replace function public.admin_set_hospital_status(p_hospital uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Doar administratorul platformei.'; end if;
  if p_status not in ('in_asteptare', 'aprobat', 'suspendat') then raise exception 'Status invalid'; end if;
  update public.hospitals set status = p_status, status_changed_at = now() where id = p_hospital;
  insert into public.activity_log (hospital_id, user_id, action, details)
    values (p_hospital, auth.uid(), 'spital_' || p_status, null);
end $$;
revoke execute on function public.admin_set_hospital_status(uuid, text) from anon;
grant execute on function public.admin_set_hospital_status(uuid, text) to authenticated;

-- Panoul arată și statusul spitalului și cine are autentificarea în doi pași.
create or replace function public.admin_hospitals()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare total_req int;
begin
  if not public.is_platform_admin() then return '[]'::jsonb; end if;
  select count(*) into total_req from public.requirements;
  return coalesce((
    select jsonb_agg(row_to_json(x) order by (x.status = 'in_asteptare') desc, x.created_at desc)
    from (
      select h.id, h.name, h.created_at, h.next_visit, h.status,
        (select count(*) from public.memberships m where m.hospital_id = h.id) as members,
        (select string_agg(coalesce(m.full_name, m.email), ', ') from public.memberships m
           where m.hospital_id = h.id and m.role = 'admin') as admins,
        (select count(*) from public.assessments a where a.hospital_id = h.id and a.status <> 'neevaluat') as evaluated,
        total_req as total_requirements,
        (select round(100.0 * sum(case a.status when 'conform' then 1 when 'partial' then 0.5 else 0 end)
                 / nullif(total_req - count(*) filter (where a.status = 'nu_se_aplica'), 0))
           from public.assessments a where a.hospital_id = h.id) as score,
        (select count(*) from public.documents d where d.hospital_id = h.id) as documents,
        (select count(*) from public.tasks t where t.hospital_id = h.id and not t.done) as open_tasks,
        (select max(l.created_at) from public.activity_log l where l.hospital_id = h.id) as last_activity
      from public.hospitals h
    ) x
  ), '[]'::jsonb);
end $$;

create or replace function public.admin_users()
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_platform_admin() then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(row_to_json(x) order by x.last_sign_in_at desc nulls last)
    from (
      select u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at,
             m.full_name, m.role, h.name as hospital_name,
             exists (select 1 from public.platform_admins p where p.user_id = u.id) as is_platform_admin,
             exists (select 1 from auth.mfa_factors f where f.user_id = u.id and f.status = 'verified') as has_mfa
      from auth.users u
      left join public.memberships m on m.user_id = u.id
      left join public.hospitals h on h.id = m.hospital_id
    ) x
  ), '[]'::jsonb);
end $$;

-- Resetarea autentificării în doi pași pentru cineva care și-a pierdut telefonul.
create or replace function public.admin_reset_mfa(p_user uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_platform_admin() then raise exception 'Doar administratorul platformei.'; end if;
  delete from auth.mfa_factors where user_id = p_user;
end $$;
revoke execute on function public.admin_reset_mfa(uuid) from anon;
grant execute on function public.admin_reset_mfa(uuid) to authenticated;

commit;

select h.name as spital, h.status from public.hospitals h order by h.created_at;
