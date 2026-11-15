-- =====================================================================
-- Acredit – schema bazei de date (Supabase / PostgreSQL)
-- Rulează acest fișier O SINGURĂ DATĂ în Supabase: SQL Editor → New query
-- → lipește tot conținutul → Run.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Spitale și membri
-- ---------------------------------------------------------------------
create table public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 200),
  next_visit date,
  created_at timestamptz not null default now()
);

create table public.memberships (
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  primary key (hospital_id, user_id)
);
create index on public.memberships (user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (hospital_id, email)
);

-- Administratorii platformei (tu, ca furnizor) pot importa standardele.
create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ---------------------------------------------------------------------
-- Catalogul de standarde (comun pentru toate spitalele)
-- ---------------------------------------------------------------------
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  sort int not null default 0
);

create table public.requirements (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  code text not null unique,
  title text not null,
  description text,
  guidance text,          -- ce verifică evaluatorul
  sort int not null default 0
);
create index on public.requirements (section_id);

create table public.sim_questions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  area text not null,
  question text not null,
  hint text,
  sort int not null default 0
);

-- ---------------------------------------------------------------------
-- Datele fiecărui spital
-- ---------------------------------------------------------------------
create table public.assessments (
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  status text not null default 'neevaluat'
    check (status in ('neevaluat', 'conform', 'partial', 'neconform', 'nu_se_aplica')),
  note text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (hospital_id, requirement_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  code text not null,
  title text not null,
  doc_type text not null default 'procedura'
    check (doc_type in ('procedura', 'protocol', 'registru', 'regulament', 'alt')),
  department text,
  owner_name text,
  review_due date,
  status text not null default 'draft' check (status in ('draft', 'aprobat', 'retras')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (hospital_id, code)
);
create index on public.documents (hospital_id);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  version int not null,
  file_path text not null,
  file_name text not null,
  notes text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create table public.document_requirements (
  document_id uuid not null references public.documents(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  primary key (document_id, requirement_id)
);
create index on public.document_requirements (hospital_id, requirement_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  title text not null,
  requirement_id uuid references public.requirements(id) on delete set null,
  owner_name text,
  due_date date,
  done boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'simulare', 'autoevaluare')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index on public.tasks (hospital_id);

create table public.sim_answers (
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  question_id uuid not null references public.sim_questions(id) on delete cascade,
  answer text not null check (answer in ('pregatit', 'de_lucrat')),
  updated_at timestamptz not null default now(),
  primary key (hospital_id, question_id)
);

-- Jurnal de activitate (cine a modificat ce și când)
create table public.activity_log (
  id bigint generated always as identity primary key,
  hospital_id uuid not null references public.hospitals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);
create index on public.activity_log (hospital_id, created_at desc);

-- ---------------------------------------------------------------------
-- Funcții ajutătoare pentru drepturi de acces
-- ---------------------------------------------------------------------
create or replace function public.is_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships where hospital_id = hid and user_id = auth.uid());
$$;

create or replace function public.can_edit(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships
                 where hospital_id = hid and user_id = auth.uid() and role in ('admin', 'editor'));
$$;

create or replace function public.is_admin(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships
                 where hospital_id = hid and user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.platform_admins where user_id = auth.uid());
$$;

-- Creează un spital nou; cel care îl creează devine administrator.
create or replace function public.create_hospital(p_name text, p_full_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'Neautentificat'; end if;
  if exists (select 1 from public.memberships where user_id = auth.uid()) then
    raise exception 'Contul aparține deja unui spital';
  end if;
  insert into public.hospitals (name) values (trim(p_name)) returning id into hid;
  insert into public.memberships (hospital_id, user_id, role, full_name, email)
    values (hid, auth.uid(), 'admin', nullif(trim(p_full_name), ''), auth.email());
  insert into public.activity_log (hospital_id, user_id, action, details)
    values (hid, auth.uid(), 'spital_creat', trim(p_name));
  return hid;
end $$;

-- Acceptă invitațiile trimise pe adresa de e-mail a utilizatorului curent.
create or replace function public.claim_invitations(p_full_name text)
returns int language plpgsql security definer set search_path = public as $$
declare n int := 0; inv record;
begin
  if auth.uid() is null then return 0; end if;
  for inv in
    select * from public.invitations
    where lower(email) = lower(auth.email()) and accepted_at is null
  loop
    insert into public.memberships (hospital_id, user_id, role, full_name, email)
      values (inv.hospital_id, auth.uid(), inv.role, nullif(trim(p_full_name), ''), auth.email())
      on conflict (hospital_id, user_id) do nothing;
    update public.invitations set accepted_at = now() where id = inv.id;
    n := n + 1;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------------
-- Row Level Security: fiecare spital își vede doar propriile date
-- ---------------------------------------------------------------------
alter table public.hospitals enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.platform_admins enable row level security;
alter table public.sections enable row level security;
alter table public.requirements enable row level security;
alter table public.sim_questions enable row level security;
alter table public.assessments enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_requirements enable row level security;
alter table public.tasks enable row level security;
alter table public.sim_answers enable row level security;
alter table public.activity_log enable row level security;

create policy hospitals_select on public.hospitals for select using (public.is_member(id));
create policy hospitals_update on public.hospitals for update using (public.is_admin(id)) with check (public.is_admin(id));

create policy memberships_select on public.memberships for select using (public.is_member(hospital_id));
create policy memberships_update on public.memberships for update
  using (public.is_admin(hospital_id) and user_id <> auth.uid())
  with check (public.is_admin(hospital_id) and user_id <> auth.uid());
create policy memberships_delete on public.memberships for delete
  using (public.is_admin(hospital_id) and user_id <> auth.uid());

create policy invitations_select on public.invitations for select using (public.is_admin(hospital_id));
create policy invitations_insert on public.invitations for insert with check (public.is_admin(hospital_id));
create policy invitations_delete on public.invitations for delete using (public.is_admin(hospital_id));

create policy platform_admins_select on public.platform_admins for select using (user_id = auth.uid());

-- Catalog: citit de orice utilizator autentificat, modificat doar de administratorii platformei
create policy sections_select on public.sections for select using (auth.uid() is not null);
create policy sections_write on public.sections for all using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy requirements_select on public.requirements for select using (auth.uid() is not null);
create policy requirements_write on public.requirements for all using (public.is_platform_admin()) with check (public.is_platform_admin());
create policy sim_questions_select on public.sim_questions for select using (auth.uid() is not null);
create policy sim_questions_write on public.sim_questions for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Date pe spital: citire pentru membri, scriere pentru admin/editor
create policy assessments_select on public.assessments for select using (public.is_member(hospital_id));
create policy assessments_write on public.assessments for all using (public.can_edit(hospital_id)) with check (public.can_edit(hospital_id));

create policy documents_select on public.documents for select using (public.is_member(hospital_id));
create policy documents_write on public.documents for all using (public.can_edit(hospital_id)) with check (public.can_edit(hospital_id));

create policy document_versions_select on public.document_versions for select using (public.is_member(hospital_id));
create policy document_versions_write on public.document_versions for all using (public.can_edit(hospital_id)) with check (public.can_edit(hospital_id));

create policy document_requirements_select on public.document_requirements for select using (public.is_member(hospital_id));
create policy document_requirements_write on public.document_requirements for all using (public.can_edit(hospital_id)) with check (public.can_edit(hospital_id));

create policy tasks_select on public.tasks for select using (public.is_member(hospital_id));
create policy tasks_write on public.tasks for all using (public.can_edit(hospital_id)) with check (public.can_edit(hospital_id));

create policy sim_answers_select on public.sim_answers for select using (public.is_member(hospital_id));
create policy sim_answers_write on public.sim_answers for all using (public.can_edit(hospital_id)) with check (public.can_edit(hospital_id));

create policy activity_select on public.activity_log for select using (public.is_member(hospital_id));
create policy activity_insert on public.activity_log for insert with check (public.is_member(hospital_id) and user_id = auth.uid());

-- Coerență: documentul legat și versiunea trebuie să aparțină aceluiași spital
create or replace function public.check_same_hospital()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.documents d where d.id = new.document_id and d.hospital_id = new.hospital_id) then
    raise exception 'Documentul nu aparține acestui spital';
  end if;
  return new;
end $$;

create trigger document_versions_same_hospital before insert or update on public.document_versions
  for each row execute function public.check_same_hospital();
create trigger document_requirements_same_hospital before insert or update on public.document_requirements
  for each row execute function public.check_same_hospital();

-- ---------------------------------------------------------------------
-- Stocare fișiere: bucket privat "documents", câte un folder pe spital
-- (calea fișierului începe cu id-ul spitalului)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_read" on storage.objects for select
  using (bucket_id = 'documents' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "documents_upload" on storage.objects for insert
  with check (bucket_id = 'documents' and public.can_edit(((storage.foldername(name))[1])::uuid));
create policy "documents_delete" on storage.objects for delete
  using (bucket_id = 'documents' and public.can_edit(((storage.foldername(name))[1])::uuid));

grant execute on function public.create_hospital(text, text) to authenticated;
grant execute on function public.claim_invitations(text) to authenticated;
