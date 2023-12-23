export type CashGroup = {
	id: string;
	createdAt: string;
	name: string;
	budget: number;
	owner: string;
};

export type InsertCashGroupDTO = {
	name: string;
	budget: string;
	owner: string;
};
export type UpdateCashGroupDTO = {
	id: string;
	name: string;
	budget: string;
};
