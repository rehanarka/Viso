-- =========================
-- COMPANIES
-- =========================
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  address text,
  office_latitude numeric,
  office_longitude numeric,
  allowed_radius_meters int default 100,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table companies enable row level security;

-- =========================
-- PROFILES
-- =========================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  full_name text,
  email text,
  telephone text,
  avatar_url text,
  provider text default 'email',
  role text check (role in ('admin', 'manager', 'employee')) default 'employee',
  status text check (status in ('active', 'inactive')) default 'active',
  last_sign_in_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table profiles enable row level security;

-- =========================
-- DEPARTMENTS
-- =========================
create table departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  description text,
  manager_id uuid references profiles(id) on delete set null,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table departments enable row level security;

-- =========================
-- POSITIONS
-- =========================
create table positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table positions enable row level security;

-- =========================
-- SHIFTS
-- =========================
create table shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  late_tolerance_minutes int default 0,
  work_days text[] default array['monday','tuesday','wednesday','thursday','friday'],
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table shifts enable row level security;

-- =========================
-- EMPLOYEES
-- =========================
create table employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  employee_code text not null,
  full_name text not null,
  email text,
  telephone text,
  address text,
  gender text check (gender in ('male', 'female')),
  birth_date date,
  department_id uuid references departments(id) on delete set null,
  position_id uuid references positions(id) on delete set null,
  shift_id uuid references shifts(id) on delete set null,
  join_date date,
  photo_url text,
  face_registered boolean default false,
  employment_status text check (employment_status in ('permanent', 'contract', 'intern')) default 'permanent',
  status text check (status in ('active', 'inactive', 'resigned')) default 'active',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(company_id, employee_code)
);

alter table employees enable row level security;

-- =========================
-- ATTENDANCE RECORDS
-- =========================
create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  type text check (type in ('check_in', 'check_out')) not null,
  attendance_date date default current_date,
  check_time timestamp default now(),
  status text check (status in ('present', 'late', 'absent', 'sick', 'leave')) default 'present',
  confidence numeric,
  latitude numeric,
  longitude numeric,
  distance_from_office numeric,
  snapshot_url text,
  verification_method text check (verification_method in ('face', 'manual', 'qr', 'gps')) default 'face',
  notes text,
  created_at timestamp default now()
);

alter table attendance_records enable row level security;

-- =========================
-- LEAVE REQUESTS
-- =========================
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  type text check (type in ('leave', 'sick', 'permission')) not null,
  start_date date not null,
  end_date date not null,
  reason text,
  attachment_url text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approved_by uuid references profiles(id) on delete set null,
  approved_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table leave_requests enable row level security;

-- =========================
-- COMPANY SETTINGS
-- =========================
create table company_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade unique,
  face_threshold numeric default 0.85,
  enable_gps boolean default true,
  enable_face_verification boolean default true,
  enable_snapshot boolean default true,
  allow_manual_attendance boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table company_settings enable row level security;

-- =========================
-- FACE EMBEDDINGS
-- =========================
create table face_embeddings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  employee_id uuid references employees(id) on delete cascade,
  embedding jsonb not null,
  model_name text default 'insightface',
  image_url text,
  is_active boolean default true,
  created_at timestamp default now()
);

alter table face_embeddings enable row level security;

-- =========================
-- AUDIT LOGS
-- =========================
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  description text,
  created_at timestamp default now()
);

alter table audit_logs enable row level security;