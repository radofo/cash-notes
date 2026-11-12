-- Cash flow suggestions created from the iOS Shortcuts "Transaction" automation.
-- Run once in the Supabase SQL Editor (runs as `postgres`, which owns the tables and functions).

begin;

-- pgcrypto (gen_random_bytes, digest) lives in the `extensions` schema on Supabase
create extension if not exists pgcrypto with schema extensions;

------------------------------------------------------------------------------
-- API tokens: one per user, only the SHA-256 hash is stored
------------------------------------------------------------------------------
create table public.user_api_token (
	owner      uuid primary key references auth.users (id) on delete cascade,
	token_hash text not null unique,
	created_at timestamptz not null default now()
);

alter table public.user_api_token enable row level security;
-- No policies + no grants: only reachable through the security definer functions below
revoke all on public.user_api_token from anon, authenticated;

------------------------------------------------------------------------------
-- Suggestions: pending entries the user approves (or dismisses) in the app
------------------------------------------------------------------------------
create table public.cash_flow_suggestion (
	id         uuid primary key default gen_random_uuid(),
	owner      uuid not null references auth.users (id) on delete cascade,
	name       text,
	amount     numeric,
	-- ISO 4217 code as reported by Apple Pay (e.g. EUR, USD); null if unknown
	currency   text check (currency ~ '^[A-Z]{3}$'),
	date      date not null,
	created_at timestamptz not null default now()
);

create index cash_flow_suggestion_owner_idx on public.cash_flow_suggestion (owner);

alter table public.cash_flow_suggestion enable row level security;
-- Inserts only happen via create_suggestion(); users can read and delete their own rows
revoke all on public.cash_flow_suggestion from anon, authenticated;
grant select, delete on public.cash_flow_suggestion to authenticated;

create policy "Owner can read own suggestions"
	on public.cash_flow_suggestion for select
	to authenticated
	using (owner = auth.uid());

create policy "Owner can delete own suggestions"
	on public.cash_flow_suggestion for delete
	to authenticated
	using (owner = auth.uid());

------------------------------------------------------------------------------
-- create_api_token(): called from the app by a logged-in user.
-- Replaces any existing token and returns the plaintext exactly once.
------------------------------------------------------------------------------
create function public.create_api_token()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
	raw text := encode(gen_random_bytes(32), 'hex');
begin
	if auth.uid() is null then
		raise exception 'not authenticated' using errcode = '28000';
	end if;

	insert into public.user_api_token (owner, token_hash)
	values (auth.uid(), encode(digest(raw, 'sha256'), 'hex'))
	on conflict (owner) do update
		set token_hash = excluded.token_hash,
		    created_at = now();

	return raw;
end;
$$;

------------------------------------------------------------------------------
-- revoke_api_token(): lets a logged-in user disable their token without a new one
------------------------------------------------------------------------------
create function public.revoke_api_token()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
	if auth.uid() is null then
		raise exception 'not authenticated' using errcode = '28000';
	end if;

	delete from public.user_api_token where owner = auth.uid();
end;
$$;

------------------------------------------------------------------------------
-- create_suggestion(): called by the API endpoint with the anon key.
-- The owner is derived from the token, never from the request.
------------------------------------------------------------------------------
create function public.create_suggestion(
	p_token  text,
	p_name   text default null,
	p_amount   numeric default null,
	p_date     date default null,
	p_currency text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
	v_owner uuid;
	v_id    uuid;
begin
	select owner into v_owner
	from public.user_api_token
	where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');

	if v_owner is null then
		raise exception 'invalid token' using errcode = '28000';
	end if;

	insert into public.cash_flow_suggestion (owner, name, amount, currency, date)
	values (
		v_owner,
		nullif(left(trim(p_name), 200), ''),
		p_amount,
		-- Store only valid codes; an unrecognised value becomes null instead of failing
		case when upper(trim(p_currency)) ~ '^[A-Z]{3}$' then upper(trim(p_currency)) end,
		coalesce(p_date, current_date)
	)
	returning id into v_id;

	return v_id;
end;
$$;

------------------------------------------------------------------------------
-- Execute permissions.
-- Supabase's default privileges grant EXECUTE on new public functions to anon and
-- authenticated, so revoking from `public` alone is not enough.
------------------------------------------------------------------------------
revoke execute on function public.create_api_token()  from public, anon, authenticated;
revoke execute on function public.revoke_api_token()  from public, anon, authenticated;
revoke execute on function public.create_suggestion(text, text, numeric, date, text)
	from public, anon, authenticated;

grant execute on function public.create_api_token() to authenticated;
grant execute on function public.revoke_api_token() to authenticated;
grant execute on function public.create_suggestion(text, text, numeric, date, text) to anon;

commit;
