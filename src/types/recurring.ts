import type { CashGroup, RecCashFlow, RecTimeframe } from './supabase';

export type TableOpenState = {
	incomes: boolean;
	expenses: boolean;
	fixedCosts: boolean;
	fixedCostsBudgets: { [key: string]: boolean };
	budgets: boolean;
};

export type TotalTableT = {
	incomes: { total: number; recurring: RecCashFlow[] };
	expenses: {
		total: number;
		fixedCosts: {
			total: number;
			budgets: Map<string, RecCashFlow[]>;
		};
		budgets: { total: number; budgets: Map<string, number> };
	};
};

export type FormTimeframe = {
	id: string;
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
