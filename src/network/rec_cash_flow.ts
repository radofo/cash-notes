import type {
	RecCashFlow,
	RecCashFlowInsert,
	RecCashFlowUpdate,
	RecTimeframe,
	RecTimeframeInsert,
	RecTimeframeUpdate
} from '../types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// INSERT
export async function insertRecCashFlow(
	dto: RecCashFlowInsert,
	supabase: SupabaseClient
): Promise<RecCashFlow> {
	const { data } = await supabase
		.from('rec_cash_flow')
		.insert([dto])
		.select('*, timeframes:rec_timeframe (*), cash_group(*)');
	return data?.[0];
}

export async function insertRecTimeframes(
	dtos: RecTimeframeInsert[],
	supabase: SupabaseClient
): Promise<RecTimeframe[]> {
	const { data } = await supabase.from('rec_timeframe').insert(dtos).select('*');
	return data ?? [];
}

// UPDATE
export async function updateRecTimeframes(
	dtos: RecTimeframeUpdate[],
	supabase: SupabaseClient
): Promise<RecTimeframe[]> {
	const { data } = await supabase.from('rec_timeframe').upsert(dtos).select('*');
	return data ?? [];
}

export async function updateRecCashFlow(
	dto: RecCashFlowUpdate,
	supabase: SupabaseClient
): Promise<RecCashFlow> {
	const { id, cash_group_id, isIncome, name } = dto;
	const { data } = await supabase
		.from('rec_cash_flow')
		.update({ name, cash_group_id, isIncome })
		.eq('id', id)
		.select('*, timeframes:rec_timeframe (*), cash_group (*)');
	return data?.[0];
}

// Delete
export async function deleteRecTimeframes(
	ids: string[],
	supabase: SupabaseClient
): Promise<boolean> {
	const res = await supabase.from('rec_timeframe').delete().in('id', ids);
	return res.status === 204;
}

export async function deleteRecCashFlow(id: string, supabase: SupabaseClient): Promise<boolean> {
	const res = await supabase.from('rec_cash_flow').delete().eq('id', id);
	return res.status === 204;
}

// GET
export async function getRecCashFlows(supabase: SupabaseClient): Promise<RecCashFlow[]> {
	const { data } = await supabase
		.from('rec_cash_flow')
		.select('*, timeframes:rec_timeframe (*), cash_group(*)');
	return data ?? [];
}
