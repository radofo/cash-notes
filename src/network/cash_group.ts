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

export async function hasCashGroupElements(id: string, supabase: SupabaseClient): Promise<boolean> {
	const { count: cfCount } = await supabase
		.from('cash_flow')
		.select('*', { count: 'exact', head: true })
		.eq('cash_group_id', id);
	const { count: rcfCount } = await supabase
		.from('rec_cash_flow')
		.select('*', { count: 'exact', head: true })
		.eq('cash_group_id', id);

	return (cfCount !== null && cfCount > 0) || (rcfCount !== null && rcfCount > 0);
}

export async function deactivateCashGroup(id: string, supabase: SupabaseClient): Promise<boolean> {
	const { status } = await supabase
		.from('cash_group')
		.update({ is_active: false })
		.eq('id', id)
		.select();
	return status === 200;
}

export async function deleteCashGroup(id: string, supabase: SupabaseClient): Promise<boolean> {
	const res = await supabase.from('cash_group').delete().eq('id', id);
	return res.status === 204;
}

export async function getCashGroups(supabase: SupabaseClient): Promise<CashGroup[]> {
	const { data } = await supabase
		.from('cash_group')
		.select()
		.order('budget', { ascending: false, nullsFirst: false });

	return data ?? [];
}
