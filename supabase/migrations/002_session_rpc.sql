-- Sessiya tizimi (Edge Function siz — faqat SQL Editor da ishga tushiring)

create or replace function public.register_user_session(
  p_ip text default 'unknown',
  p_user_agent text default 'unknown'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_session_id text;
  v_ip_count int;
  v_email text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Avtorizatsiya kerak';
  end if;

  insert into public.profiles (id, full_name, role)
  values (v_user_id, 'Foydalanuvchi', 'student')
  on conflict (id) do nothing;

  v_session_id := gen_random_uuid()::text;

  insert into public.login_logs (user_id, ip_address, user_agent)
  values (v_user_id, p_ip, p_user_agent);

  update public.profiles
  set active_session_id = v_session_id, updated_at = now()
  where id = v_user_id;

  select count(distinct ip_address) into v_ip_count
  from public.login_logs
  where user_id = v_user_id
    and created_at >= date_trunc('day', now() at time zone 'utc')
    and ip_address is not null
    and ip_address <> 'unknown';

  if v_ip_count >= 5 then
    select email into v_email from auth.users where id = v_user_id;

    if not exists (
      select 1 from public.security_alerts
      where user_id = v_user_id
        and alert_type = 'multi_ip'
        and created_at >= date_trunc('day', now() at time zone 'utc')
    ) then
      insert into public.security_alerts (user_id, alert_type, message, ip_count)
      values (
        v_user_id,
        'multi_ip',
        coalesce(v_email, 'noma''lum') || ' bugun ' || v_ip_count || ' xil IP dan kirdi. Shubhali faoliyat!',
        v_ip_count
      );
    end if;
  end if;

  return json_build_object('session_id', v_session_id, 'ip', p_ip);
end;
$$;

create or replace function public.validate_user_session(p_session_id text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_profile public.profiles%rowtype;
  v_email text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return json_build_object('valid', false);
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  select email into v_email from auth.users where id = v_user_id;

  if v_profile.active_session_id is not null and v_profile.active_session_id = p_session_id then
    return json_build_object(
      'valid', true,
      'role', v_profile.role,
      'full_name', v_profile.full_name,
      'email', v_email
    );
  end if;

  return json_build_object(
    'valid', false,
    'reason', 'Boshqa qurilmadan kirilgan — sessiya tugatildi'
  );
end;
$$;

grant execute on function public.register_user_session(text, text) to authenticated;
grant execute on function public.validate_user_session(text) to authenticated;
