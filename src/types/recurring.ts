import type { CashGroup, RecCashFlow, RecTimeframe } from './supabase';

export type FormTimeframe = {
	id?: string;
	startMonth: number;
	startYear: number;
	amount: string;
};

export type CashGroupMap = Map<
	string,
	{
		recurringCashFlows: {
			recCashFlow: RecCashFlow;
			activeTimeframe?: RecTimeframe;
		}[];
		cashGroup: {
			group?: CashGroup;
			total?: number;
		};
	}
>;

export const INCOME_ID = 'income-id';
