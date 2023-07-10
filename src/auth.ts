import type { SupabaseClient } from '@supabase/supabase-js';
import type { InsertCashGroupDTO } from './supabaseTypes';

export async function insertCashGroup(dto: InsertCashGroupDTO, supabase: SupabaseClient) {
	const { data, error } = await supabase.from('cash_group').insert([dto]).select();
	console.log('error:', error);
	console.log('data:', data);
}
