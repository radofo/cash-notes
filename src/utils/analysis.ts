import type {
	CategorySpendings,
	CategorySpendingsMeta,
	CategorySpendingsStore,
	DBSpendings,
	Spendings,
	SpendingsMeta,
	TimeframeFilter
} from '../types/analysis';

export function getTimeframeCategorySpendings(
	categorySpendingsStore: CategorySpendingsStore,
	timeframe: TimeframeFilter,
	allCashGroups: string[]
): { spending: CategorySpendings; monthLabels: string[] } {
	const categorySpendings: CategorySpendings = new Map();
	let relevantMonths: string[] = [];
	if (timeframe.id.startsWith('year')) {
		relevantMonths = getMonthLabelsForYear(timeframe.value.toString());
	} else {
		const date = new Date();
		relevantMonths = getMonthLabelsLastXMonths(timeframe.value, date);
	}
	for (const cashGroup of allCashGroups) {
		for (const month of relevantMonths) {
			const spendings = categorySpendingsStore.get(month)?.get(cashGroup) || 0;
			const currentSpendings = categorySpendings.get(cashGroup) || [];
			categorySpendings.set(cashGroup, [...currentSpendings, spendings]);
		}
	}
	return { spending: categorySpendings, monthLabels: relevantMonths };
}

export function getAllCashGroups(dbSpendings: DBSpendings): string[] {
	const cashGroups = new Set<string>();
	for (const { cash_group_name } of dbSpendings) {
		cashGroups.add(cash_group_name);
	}
	return Array.from(cashGroups);
}

export function getMonthLabelsForYear(year: string): string[] {
	const labels: string[] = [];
	for (let i = 1; i <= 12; i++) {
		labels.push(`${year}-${i.toString().padStart(2, '0')}`);
	}
	return labels;
}

export function getMonthLabelsLastXMonths(x: number, date: Date): string[] {
	const labels: string[] = [];

	for (let i = 0; i < x; i++) {
		const newDate = new Date(date.getFullYear(), date.getMonth() - (i + 1), 1);
		const year = newDate.getFullYear();
		const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
		labels.push(`${year}-${month}`);
	}

	return labels.reverse();
}

export function createTimeframeLabel(filter?: TimeframeFilter): string {
	if (!filter) return '-';
	if (filter.id.startsWith('year')) {
		return `Jahr ${filter.value}`;
	}
	return `Letzte ${filter.value} Monate`;
}

export function getTimeframeFilters(fullSpendingYears: number[]): TimeframeFilter[] {
	const filters: TimeframeFilter[] = [];
	for (const year of fullSpendingYears) {
		filters.push({ id: `year_${year}`, value: year });
	}
	return [
		...filters,
		{ id: `last_3`, value: 3 },
		{ id: 'last_6', value: 6 },
		{ id: 'last_12', value: 12 }
	];
}

export function getFullSpendingYears(spendingsStore: CategorySpendingsStore): number[] {
	const fullYears = new Set<number>();
	for (const monthYear of spendingsStore.keys()) {
		fullYears.add(parseInt(monthYear.slice(0, 4)));
	}
	return Array.from(fullYears).sort((a, b) => b - a);
}

export function initCategorySpendingsStore(dbSpendings: DBSpendings): CategorySpendingsStore {
	const categorySpendingsStore: CategorySpendingsStore = new Map();
	for (const { cash_group_name, month_year, total_amount } of dbSpendings) {
		const categoriesSpendings = categorySpendingsStore.get(month_year) || new Map();
		categoriesSpendings.set(cash_group_name, total_amount);
		categorySpendingsStore.set(month_year, categoriesSpendings);
	}
	return categorySpendingsStore;
}

export function getCategoriesMeta(categorySpendings: CategorySpendings): CategorySpendingsMeta {
	const categorySpendingsMeta: CategorySpendingsMeta = new Map();
	for (const [category, spendings] of categorySpendings) {
		categorySpendingsMeta.set(category, getSpendingsMeta(spendings));
	}
	return categorySpendingsMeta;
}

export function getTotalSpendings(categorySpendings: CategorySpendings): Spendings {
	const totalSpendings: Spendings = [];
	for (const spendings of categorySpendings.values()) {
		for (let i = 0; i < spendings.length; i++) {
			totalSpendings[i] = (totalSpendings[i] || 0) + spendings[i];
		}
	}
	return totalSpendings;
}

export function sumUpTotalSpendings(categorySpendings: CategorySpendings): number {
	return getTotalSpendings(categorySpendings).reduce((acc, value) => acc + value, 0);
}

export function getSpendingsMeta(totalSpendings: Spendings): SpendingsMeta {
	if (totalSpendings.length === 0) {
		return { total: 0, average: 0 };
	}
	const total = totalSpendings.reduce((acc, value) => acc + value, 0);
	const average = total / totalSpendings.filter((sp) => sp !== 0).length;
	return { total, average };
}
