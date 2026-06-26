-- Replace this with the email used to log in to the app.
select
  u.id as auth_user_id,
  u.email,
  p.id as profile_id,
  p.company_id,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'YOUR_LOGIN_EMAIL_HERE';

-- If profile_id is null, create the missing profile row.
-- Replace the values before running.
insert into public.profiles (
  id,
  company_id,
  full_name,
  email,
  role,
  provider
)
values (
  'AUTH_USER_ID_HERE',
  'COMPANY_ID_HERE',
  'YOUR_NAME_HERE',
  'YOUR_LOGIN_EMAIL_HERE',
  'admin',
  'email'
)
on conflict (id) do update
set
  company_id = excluded.company_id,
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  provider = excluded.provider;
