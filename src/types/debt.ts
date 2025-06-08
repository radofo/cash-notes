import type { Profile } from './friendship';

// Debt
export type DebtAgreement = 'accepted' | 'rejected' | 'pending';

type DebtBase = {
	id: string;
	createdAt: string;
	date: string;
	name: string;
	amount: number;
	is_accepted: DebtAgreement;
	settlement_id: string | null;
};

export type DebtFlat = DebtBase & {
	from_id: string | null;
	for_id: string | null;
};

export type DebtWithProfile = DebtBase & {
	from_id: string | null;
	for_id: string | null;
	from: Profile | null;
	for: Profile | null;
};

export type DebtInsert = {
	date: string;
	name: string;
	amount: number;
	from_id: string;
	for_id: string;
	is_accepted?: DebtAgreement;
};

export type DebtUpdate = {
	id: string;
	date?: string;
	name?: string;
	amount?: number;
	is_accepted?: DebtAgreement;
	settlement_id?: string | null;
	from_id?: string | null;
	for_id?: string | null;
};
