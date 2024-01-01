import type { CashFlow, CashFlowInsert, CashFlowUpdate } from '../types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { dateToDateString } from '../utils/date';
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
dayjs.extend(objectSupport);

export async function insertCashFlow(
	dto: CashFlowInsert,
	supabase: SupabaseClient
): Promise<CashFlow> {
	const { data } = await supabase.from('cash_flow').insert([dto]).select('*, cash_group (*)');
	return data?.[0];
}

export async function updateCashFlow(
	dto: CashFlowUpdate,
	supabase: SupabaseClient
): Promise<CashFlow> {
	const { id, name, date, amount, cash_group_id } = dto;
	const { data } = await supabase
		.from('cash_flow')
		.update({ name, date, amount, cash_group_id })
		.eq('id', id)
		.select('*, cash_group (*)');
	return data?.[0];
}

export async function deleteCashFlow(id: string, supabase: SupabaseClient): Promise<boolean> {
	const res = await supabase.from('cash_flow').delete().eq('id', id);
	return res.status === 204;
}

export async function getCashFlows(
	supabase: SupabaseClient,
	month: number,
	year: number
): Promise<CashFlow[]> {
	const thisMonthDate = dayjs({ year, month, day: 1 });
	const nextMonthDate = thisMonthDate.add(1, 'M');
	const { data } = await supabase
		.from('cash_flow')
		.select('*, cash_group(*)')
		.gte('date', dateToDateString(thisMonthDate.toDate()))
		.lte('date', dateToDateString(nextMonthDate.toDate()))
		.order('date', { ascending: false, nullsFirst: false })
		.order('created_at', { ascending: false, nullsFirst: false });

	return data ?? [];
}

export function isInMonth(cashFlow: CashFlow, month: number, year: number): boolean {
	const thisMonthDate = dayjs({ year, month, day: 1 });
	const nextMonthDate = thisMonthDate.add(1, 'M');
	const cashFlowDate = dayjs(cashFlow.date);

	return cashFlowDate.isAfter(thisMonthDate) && cashFlowDate.isBefore(nextMonthDate);
}
