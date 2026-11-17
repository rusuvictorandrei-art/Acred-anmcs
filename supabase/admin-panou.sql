-- =====================================================================
-- Acredit – panoul de administrare a platformei
-- Rulează O SINGURĂ DATĂ în Supabase: SQL Editor → New query → lipește → Run.
-- (Poate fi rulat din nou fără probleme.)
--
-- Creează funcțiile care îi arată administratorului platformei toate spitalele,
-- toți utilizatorii (cu ultima conectare) și activitatea. Funcțiile verifică
-- singure că cel care le apelează este administrator al platformei; pentru
-- oricine altcineva nu întorc nimic.
-- =====================================================================

-- Rezumatul fiecărui spital
create or replace function public.admin_hospitals()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare total_req int;
begin
  if not public.is_platform_admin() then return '[]'::jsonb; end if;
  select count(*) into total_req from public.requirements;
  return coalesce((
    select jsonb_agg(row_to_json(x) order by x.created_at desc)
    from (
      select h.id, h.name, h.created_at, h.next_visit,
        (select count(*) from public.memberships m where m.hospital_id = h.id) as members,
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

-- Toți utilizatorii, cu spitalul, rolul și ultima conectare
create or replace function public.admin_users()
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_platform_admin() then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(row_to_json(x) order by x.last_sign_in_at desc nulls last)
    from (
      select u.id, u.email, u.created_at, u.last_sign_in_at, u.email_confirmed_at,
             m.full_name, m.role, h.name as hospital_name,
             exists (select 1 from public.platform_admins p where p.user_id = u.id) as is_platform_admin
      from auth.users u
      left join public.memberships m on m.user_id = u.id
      left join public.hospitals h on h.id = m.hospital_id
    ) x
  ), '[]'::jsonb);
end $$;

-- Activitatea recentă pe toată platforma
create or replace function public.admin_activity(p_limit int default 100)
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_platform_admin() then return '[]'::jsonb; end if;
  return coalesce((
    select jsonb_agg(row_to_json(x) order by x.created_at desc)
    from (
      select l.id, l.created_at, l.action, l.details, h.name as hospital_name, u.email
      from public.activity_log l
      join public.hospitals h on h.id = l.hospital_id
      left join auth.users u on u.id = l.user_id
      order by l.created_at desc
      limit least(greatest(p_limit, 1), 500)
    ) x
  ), '[]'::jsonb);
end $$;

revoke execute on function public.admin_hospitals() from anon;
revoke execute on function public.admin_users() from anon;
revoke execute on function public.admin_activity(int) from anon;
grant execute on function public.admin_hospitals() to authenticated;
grant execute on function public.admin_users() to authenticated;
grant execute on function public.admin_activity(int) to authenticated;

-- Administratorul platformei. Contul trebuie să existe deja în aplicație.
insert into public.platform_admins (user_id)
select id from auth.users where lower(email) = lower('rusu_victor_andrei@yahoo.com')
on conflict (user_id) do nothing;

select u.email, (p.user_id is not null) as este_administrator
from auth.users u
left join public.platform_admins p on p.user_id = u.id
where lower(u.email) = lower('rusu_victor_andrei@yahoo.com');
