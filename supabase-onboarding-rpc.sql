create or replace function public.create_company_with_admin(
  company_name text,
  full_name text,
  user_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if nullif(trim(company_name), '') is null then
    raise exception 'Company name is required';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Profile already exists';
  end if;

  insert into public.companies (name)
  values (trim(company_name))
  returning id into new_company_id;

  insert into public.profiles (
    id,
    company_id,
    full_name,
    email,
    role,
    provider
  )
  values (
    auth.uid(),
    new_company_id,
    trim(full_name),
    lower(trim(user_email)),
    'admin',
    'email'
  );

  return new_company_id;
end;
$$;

revoke all on function public.create_company_with_admin(text, text, text) from public;
grant execute on function public.create_company_with_admin(text, text, text) to authenticated;

create or replace function public.get_my_profile()
returns table (
  id uuid,
  company_id uuid,
  role text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.company_id,
    p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_my_profile() from public;
grant execute on function public.get_my_profile() to authenticated;

create or replace function public.get_my_departments()
returns setof public.departments
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  return query
  select d.*
  from public.departments d
  where d.company_id = current_profile.company_id
  order by d.created_at desc;
end;
$$;

revoke all on function public.get_my_departments() from public;
grant execute on function public.get_my_departments() to authenticated;

create or replace function public.create_department_for_my_company(
  p_name text,
  p_description text default null,
  p_status text default 'active'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
  normalized_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  if current_profile.role not in ('admin', 'manager') then
    raise exception 'Only admins or managers can create departments';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Department name is required';
  end if;

  normalized_status := lower(trim(coalesce(p_status, 'active')));

  if normalized_status not in ('active', 'inactive') then
    normalized_status := 'active';
  end if;

  insert into public.departments (
    company_id,
    name,
    description,
    status
  )
  values (
    current_profile.company_id,
    trim(p_name),
    nullif(trim(p_description), ''),
    normalized_status
  );
end;
$$;

revoke all on function public.create_department_for_my_company(text, text, text) from public;
grant execute on function public.create_department_for_my_company(text, text, text) to authenticated;

create or replace function public.update_department_for_my_company(
  p_department_id uuid,
  p_name text,
  p_description text default null,
  p_status text default 'active'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
  normalized_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  if current_profile.role not in ('admin', 'manager') then
    raise exception 'Only admins or managers can update departments';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Department name is required';
  end if;

  normalized_status := lower(trim(coalesce(p_status, 'active')));

  if normalized_status not in ('active', 'inactive') then
    normalized_status := 'active';
  end if;

  update public.departments
  set
    name = trim(p_name),
    description = nullif(trim(p_description), ''),
    status = normalized_status,
    updated_at = now()
  where id = p_department_id
  and company_id = current_profile.company_id;
end;
$$;

revoke all on function public.update_department_for_my_company(uuid, text, text, text) from public;
grant execute on function public.update_department_for_my_company(uuid, text, text, text) to authenticated;

create or replace function public.delete_department_for_my_company(
  p_department_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  if current_profile.role not in ('admin', 'manager') then
    raise exception 'Only admins or managers can delete departments';
  end if;

  delete from public.departments
  where id = p_department_id
  and company_id = current_profile.company_id;
end;
$$;

revoke all on function public.delete_department_for_my_company(uuid) from public;
grant execute on function public.delete_department_for_my_company(uuid) to authenticated;

create or replace function public.create_employee_for_my_company(
  p_full_name text,
  p_email text,
  p_status text default 'active',
  p_department_id uuid default null,
  p_position_name text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
  normalized_status text;
  resolved_position_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  if current_profile.role not in ('admin', 'manager') then
    raise exception 'Only admins or managers can create employees';
  end if;

  normalized_status := lower(trim(coalesce(p_status, 'active')));

  if normalized_status in ('on leave', 'pending') then
    normalized_status := 'active';
  end if;

  if normalized_status not in ('active', 'inactive', 'resigned') then
    normalized_status := 'active';
  end if;

  if nullif(trim(coalesce(p_position_name, '')), '') is not null then
    select id
    into resolved_position_id
    from public.positions
    where company_id = current_profile.company_id
    and lower(name) = lower(trim(p_position_name))
    limit 1;

    if resolved_position_id is null then
      insert into public.positions (
        company_id,
        name
      )
      values (
        current_profile.company_id,
        trim(p_position_name)
      )
      returning id into resolved_position_id;
    end if;
  end if;

  insert into public.employees (
    company_id,
    profile_id,
    employee_code,
    full_name,
    email,
    department_id,
    position_id,
    status
  )
  values (
    current_profile.company_id,
    null,
    'EMP-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || floor(random() * 9000 + 1000)::int,
    trim(p_full_name),
    nullif(lower(trim(p_email)), ''),
    p_department_id,
    resolved_position_id,
    normalized_status
  );
end;
$$;

revoke all on function public.create_employee_for_my_company(text, text, text, uuid, text) from public;
grant execute on function public.create_employee_for_my_company(text, text, text, uuid, text) to authenticated;

create or replace function public.get_my_employees()
returns setof public.employees
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  return query
  select e.*
  from public.employees e
  where e.company_id = current_profile.company_id
  order by e.created_at desc;
end;
$$;

revoke all on function public.get_my_employees() from public;
grant execute on function public.get_my_employees() to authenticated;

create or replace function public.claim_employee_profile(
  p_full_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  current_email text;
  matched_employee record;
  matched_employee_id uuid;
  employee_pk_column text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select lower(email)
  into current_email
  from auth.users
  where id = current_user_id;

  if current_email is null then
    raise exception 'Authenticated user has no email';
  end if;

  select case
    when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'employees_id'
    ) then 'employees_id'
    else 'id'
  end
  into employee_pk_column;

  execute format(
    'select *, %I as resolved_employee_id from public.employees where lower(email) = $1 order by created_at desc limit 1',
    employee_pk_column
  )
  into matched_employee
  using current_email;

  matched_employee_id := (to_jsonb(matched_employee)->>'resolved_employee_id')::uuid;

  if matched_employee_id is null then
    raise exception 'No employee record found for this email';
  end if;

  insert into public.profiles (
    id,
    company_id,
    full_name,
    email,
    role,
    provider,
    status
  )
  values (
    current_user_id,
    matched_employee.company_id,
    coalesce(nullif(trim(p_full_name), ''), matched_employee.full_name),
    current_email,
    'employee',
    'email',
    'active'
  )
  on conflict (id) do update
  set
    company_id = excluded.company_id,
    full_name = excluded.full_name,
    email = excluded.email,
    role = 'employee',
    provider = excluded.provider,
    status = excluded.status;

  execute format(
    'update public.employees set profile_id = $1 where %I = $2',
    employee_pk_column
  )
  using current_user_id, matched_employee_id;

  return matched_employee_id;
end;
$$;

revoke all on function public.claim_employee_profile(text) from public;
grant execute on function public.claim_employee_profile(text) to authenticated;

create or replace function public.save_my_face_embedding(
  p_embedding jsonb,
  p_model_name text default 'insightface'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
  matched_employee record;
  matched_employee_id uuid;
  employee_pk_column text;
  embedding_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  select case
    when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'employees_id'
    ) then 'employees_id'
    else 'id'
  end
  into employee_pk_column;

  execute format(
    'select *, %I as resolved_employee_id from public.employees where company_id = $1 and profile_id = $2 limit 1',
    employee_pk_column
  )
  into matched_employee
  using current_profile.company_id, auth.uid();

  matched_employee_id := (to_jsonb(matched_employee)->>'resolved_employee_id')::uuid;

  if matched_employee_id is null then
    raise exception 'No employee record linked to this profile';
  end if;

  insert into public.face_embeddings (
    company_id,
    employee_id,
    embedding,
    model_name,
    is_active
  )
  values (
    current_profile.company_id,
    matched_employee_id,
    p_embedding,
    coalesce(nullif(trim(p_model_name), ''), 'insightface'),
    true
  )
  returning id into embedding_id;

  execute format(
    'update public.employees set face_registered = true, updated_at = now() where %I = $1 and company_id = $2',
    employee_pk_column
  )
  using matched_employee_id, current_profile.company_id;

  return embedding_id;
end;
$$;

revoke all on function public.save_my_face_embedding(jsonb, text) from public;
grant execute on function public.save_my_face_embedding(jsonb, text) to authenticated;

create or replace function public.clear_my_face_embeddings()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
  matched_employee record;
  matched_employee_id uuid;
  employee_pk_column text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  select case
    when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'employees_id'
    ) then 'employees_id'
    else 'id'
  end
  into employee_pk_column;

  execute format(
    'select *, %I as resolved_employee_id from public.employees where company_id = $1 and profile_id = $2 limit 1',
    employee_pk_column
  )
  into matched_employee
  using current_profile.company_id, auth.uid();

  matched_employee_id := (to_jsonb(matched_employee)->>'resolved_employee_id')::uuid;

  if matched_employee_id is null then
    raise exception 'No employee record linked to this profile';
  end if;

  update public.face_embeddings
  set is_active = false
  where company_id = current_profile.company_id
  and employee_id = matched_employee_id;
end;
$$;

revoke all on function public.clear_my_face_embeddings() from public;
grant execute on function public.clear_my_face_embeddings() to authenticated;

create or replace function public.get_my_face_embedding()
returns table (
  employee_id uuid,
  full_name text,
  embedding jsonb,
  model_name text,
  created_at timestamp
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile record;
  employee_pk_column text;
  matched_employee record;
  matched_employee_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select id, company_id, role
  into current_profile
  from public.profiles
  where id = auth.uid()
  limit 1;

  if current_profile.company_id is null then
    raise exception 'Profile is not linked to a company';
  end if;

  select case
    when exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
      and table_name = 'employees'
      and column_name = 'employees_id'
    ) then 'employees_id'
    else 'id'
  end
  into employee_pk_column;

  execute format(
    'select *, %I as resolved_employee_id from public.employees where company_id = $1 and profile_id = $2 limit 1',
    employee_pk_column
  )
  into matched_employee
  using current_profile.company_id, auth.uid();

  matched_employee_id := (to_jsonb(matched_employee)->>'resolved_employee_id')::uuid;

  if matched_employee_id is null then
    return;
  end if;

  return query
  select
    fe.employee_id,
    matched_employee.full_name,
    fe.embedding,
    fe.model_name,
    fe.created_at
  from public.face_embeddings fe
  where fe.company_id = current_profile.company_id
  and fe.employee_id = matched_employee_id
  and fe.is_active = true
  order by fe.created_at desc
  limit 5;
end;
$$;

revoke all on function public.get_my_face_embedding() from public;
grant execute on function public.get_my_face_embedding() to authenticated;

notify pgrst, 'reload schema';
