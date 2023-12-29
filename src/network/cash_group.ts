import type { SupabaseClient } from '@supabase/supabase-js';
import type { CashGroup, CashGroupInsert, CashGroupUpdate } from '../types/supabase';

export async function insertCashGroup(
	dto: CashGroupInsert,
	supabase: SupabaseClient
): Promise<CashGroup> {
	const { data } = await supabase.from('cash_group').insert([dto]).select();
	return data?.[0];
}

export async function updateCashGroup(
	dto: CashGroupUpdate,
	supabase: SupabaseClient
): Promise<CashGroup> {
	const { data } = await supabase
		.from('cash_group')
		.update({ name: dto.name, budget: dto.budget })
		.eq('id', dto.id)
		.select();
	return data?.[0];
}

export async function deleteCashGroup(id: string, supabase: SupabaseClient): Promise<boolean> {
	const res = await supabase.from('cash_group').delete().eq('id', id);
	return res.status === 204;
}

export async function getCashGroups(supabase: SupabaseClient): Promise<CashGroup[]> {
	const { data } = await supabase.from('cash_group').select();

	return data ?? [];
}
