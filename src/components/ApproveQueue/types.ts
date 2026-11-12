import type { CashGroup } from '../../types/supabase';

export type ApproveQueueItem = {
	id: string;
	name: string;
	amount: number | null;
	date: string;
};

export type ApproveQueueValues = {
	name: string;
	amount: number;
	cashGroup: CashGroup;
	date: string;
};
