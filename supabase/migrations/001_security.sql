-- MO Academy xavfsizlik tizimi
-- Supabase Dashboard > SQL Editor da ishga tushiring

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  active_session_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.login_logs (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists login_logs_user_created_idx
  on public.login_logs (user_id, created_at desc);

create table if not exists public.security_alerts (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  alert_type text not null default 'multi_ip',
  message text not null,
  ip_count int,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create index if not exists security_alerts_unread_idx
  on public.security_alerts (is_read, created_at desc);

-- Yangi foydalanuvchi uchun profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.login_logs enable row level security;
alter table public.security_alerts enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_admin_select" on public.profiles;
create policy "profiles_admin_select"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "login_logs_admin_select" on public.login_logs;
create policy "login_logs_admin_select"
  on public.login_logs for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "security_alerts_admin_select" on public.security_alerts;
create policy "security_alerts_admin_select"
  on public.security_alerts for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

drop policy if exists "security_alerts_admin_update" on public.security_alerts;
create policy "security_alerts_admin_update"
  on public.security_alerts for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
