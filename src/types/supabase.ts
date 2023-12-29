/** Cash Group */
export type CashGroup = {
	id: string;
	createdAt: string;
	name: string;
	budget: number;
	owner: string;
};

export type CashGroupInsert = {
	name: string;
	budget: string;
	owner: string;
};
export type CashGroupUpdate = {
	id: string;
	name: string;
	budget: string;
};

/** Cash Flow */
export type CashFlow = {
	id: string;
	createdAt: string;
	date: string;
	name: string;
	amount: number;
	cash_group?: CashGroup;
	owner: string;
};

export type CashFlowInsert = {
	name: string;
	date: string;
	amount: number;
	cash_group_id: string;
	owner: string;
};

export type CashFlowUpdate = {
	id: string;
	name: string;
	date: string;
	amount: number;
	cash_group_id: string;
};
