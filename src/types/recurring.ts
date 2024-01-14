import type { CashGroup, RecCashFlow, RecTimeframe } from './supabase';

export type FormTimeframe = {
	id?: string;
	startMonth: number;
	startYear: number;
	amount: string;
};

export type CashGroupWithMeta = {
	cashGroup?: CashGroup;
	recurringCashFlows: {
		recCashFlow: RecCashFlow;
		activeTimeframe?: RecTimeframe;
	}[];
	total?: number;
};

export type CashGroupMap = Map<string, CashGroupWithMeta>;

export const INCOME_ID = 'income-id';
