export type Spendings = number[];
export type SpendingsMeta = {
	total: number;
	average: number;
};
export type CategorySpendings = Map<string, Spendings>;
export type CategorySpendingsMeta = Map<string, SpendingsMeta>;
export type MonthLabels = string[];

export type DBSpendings = {
	cash_group_name: string;
	month_year: string;
	total_amount: number;
}[];

export type CategorySpendingsStore = Map<string, Map<string, number>>;

export type TimeframeFilter = {
	id: string;
	value: number;
};
