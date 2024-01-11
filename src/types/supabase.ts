/** Cash Group */
export type CashGroup = {
	id: string;
	createdAt: string;
	name: string;
	budget: number | null;
	owner: string;
};

export type CashGroupInsert = {
	name: string;
	budget: string | null;
	owner: string;
};
export type CashGroupUpdate = {
	id: string;
	name?: string;
	budget?: string | null;
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
	name?: string;
	date?: string;
	amount?: number;
	cash_group_id?: string;
};

/** Recurring Cash Flow */
export type RecCashFlow = {
	id: string;
	createdAt: string;
	name: string;
	isIncome: boolean;
	cash_group?: CashGroup;
	owner: string;
	timeframes: RecTimeframe[];
};

export type RecCashFlowInsert = {
	name: string;
	isIncome: boolean;
	cash_group_id?: string;
	owner: string;
};

export type RecCashFlowUpdate = {
	id: string;
	name?: string;
	isIncome?: boolean;
	cash_group_id?: string;
};

/** Recurring Cash Flow Timeframe */
export type RecTimeframe = {
	id: string;
	createdAt: string;
	amount: number;
	owner: string;
	start_date: string;
	rec_cash_flow_id: string;
};

export type RecTimeframeInsert = {
	amount: number;
	owner: string;
	start_date: string;
	rec_cash_flow_id: string;
};

export type RecTimeframeUpdate = {
	id: string;
	owner: string;
	rec_cash_flow_id: string;
	amount?: number;
	start_date?: string;
};
