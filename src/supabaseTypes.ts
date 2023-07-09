export type CashGroup = {
	id: string;
	createdAt: string;
	name: string;
	budget: number;
	user_id: string;
	isSaving: boolean;
	isDefinedByFixedCost: boolean;
	isRestOfSaving: boolean;
	tags: string[];
};

export type InsertCashGroupDTO = Omit<CashGroup, 'id' | 'createdAt'>;
export type UpdateCashGroupDTO = CashGroup;
