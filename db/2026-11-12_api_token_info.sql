-- Lets the profile page show whether the logged-in user has an active API token
-- (user_api_token itself is not readable through the API).

create function public.get_api_token_created_at()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
	select created_at from public.user_api_token where owner = auth.uid();
$$;

revoke execute on function public.get_api_token_created_at() from public, anon, authenticated;
grant execute on function public.get_api_token_created_at() to authenticated;
