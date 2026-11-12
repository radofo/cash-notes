import type { SupabaseClient } from '@supabase/supabase-js';
import type { CashFlowSuggestion } from '../types/supabase';

export async function getSuggestions(supabase: SupabaseClient): Promise<CashFlowSuggestion[]> {
	const { data } = await supabase
		.from('cash_flow_suggestion')
		.select('*')
		.order('date', { ascending: false })
		.order('created_at', { ascending: false });
	return data ?? [];
}

export async function deleteSuggestion(id: string, supabase: SupabaseClient): Promise<boolean> {
	const res = await supabase.from('cash_flow_suggestion').delete().eq('id', id);
	return res.status === 204;
}
