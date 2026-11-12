import type { SupabaseClient } from '@supabase/supabase-js';

export async function getApiTokenCreatedAt(supabase: SupabaseClient): Promise<string | null> {
	const { data } = await supabase.rpc('get_api_token_created_at');
	return data ?? null;
}

/** Creates a new token (replacing the old one) and returns its plaintext. */
export async function createApiToken(supabase: SupabaseClient): Promise<string | null> {
	const { data, error } = await supabase.rpc('create_api_token');
	if (error) {
		console.error('Error creating API token:', error);
		return null;
	}
	return data;
}

export async function revokeApiToken(supabase: SupabaseClient): Promise<boolean> {
	const { error } = await supabase.rpc('revoke_api_token');
	return !error;
}
