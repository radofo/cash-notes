export type BudgetProgress = {
	spent: number;
	limit: number | null;
};

export type BudgetProgressMap = Map<string, BudgetProgress>;
