import type {
    CategorySpendings,
    CategorySpendingsMeta,
    CategorySpendingsStore,
    DBSpendings,
    MonthRange,
    Spendings,
    SpendingsMeta,
    TimeframeFilter
} from '../types/analysis';

export function getMonthsInRange(range: MonthRange): string[] {
	const { fromMonth, fromYear, toMonth, toYear } = range;
	const months: string[] = [];

	// If toMonth/toYear is null, just return the single from month
	const endMonth = toMonth ?? fromMonth;
	const endYear = toYear ?? fromYear;

	let currentMonth = fromMonth;
	let currentYear = fromYear;

	while (
		currentYear < endYear ||
		(currentYear === endYear && currentMonth <= endMonth)
	) {
		const monthStr = (currentMonth + 1).toString().padStart(2, '0');
		months.push(`${currentYear}-${monthStr}`);

		currentMonth++;
		if (currentMonth > 11) {
			currentMonth = 0;
			currentYear++;
		}
	}

	return months;
}

export function getMonthRangeCategorySpendings(
	categorySpendingsStore: CategorySpendingsStore,
	monthRange: MonthRange,
	allCashGroups: string[],
	selectedBudgets: string[]
): { spending: CategorySpendings; monthLabels: string[] } {
	const categorySpendings: CategorySpendings = new Map();
	const relevantMonths = getMonthsInRange(monthRange);
	const budgetsToUse = selectedBudgets.length > 0 ? selectedBudgets : allCashGroups;

	for (const cashGroup of budgetsToUse) {
		for (const month of relevantMonths) {
			const spendings = categorySpendingsStore.get(month)?.get(cashGroup) || 0;
			const currentSpendings = categorySpendings.get(cashGroup) || [];
			categorySpendings.set(cashGroup, [...currentSpendings, spendings]);
		}
	}

	return { spending: categorySpendings, monthLabels: relevantMonths };
}

export function getDefaultMonthRange(): MonthRange {
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	// Calculate 6 months ago
	let fromMonth = currentMonth - 5;
	let fromYear = currentYear;

	if (fromMonth < 0) {
		fromMonth += 12;
		fromYear -= 1;
	}

	return {
		fromMonth,
		fromYear,
		toMonth: currentMonth,
		toYear: currentYear
	};
}

export function getTimeframeCategorySpendings(
	categorySpendingsStore: CategorySpendingsStore,
	timeframe: TimeframeFilter,
	allCashGroups: string[]
): { spending: CategorySpendings; monthLabels: string[] } {
	const categorySpendings: CategorySpendings = new Map();
	let relevantMonths: string[] = [];
	if (timeframe.id.startsWith('year')) {
		relevantMonths = getMonthLabelsForYear(timeframe.value.toString());
	} else if (timeframe.id.startsWith('last')) {
		const date = new Date();
		relevantMonths = getMonthLabelsLastXMonths(parseInt(timeframe.value), date);
	} else if (timeframe.id.startsWith('month')) {
		relevantMonths = [timeframe.value];
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
	} else if (filter.id.startsWith('month')) {
		return filter.value;
	}
	return `Letzte ${filter.value} Monate`;
}

export function getTimeframeFilters(
	fullSpendingYears: string[],
	spendingMonths: string[]
): TimeframeFilter[] {
	const yearFilters: TimeframeFilter[] = [];
	for (const year of fullSpendingYears) {
		yearFilters.push({ id: `year_${year}`, value: `${year}` });
	}
	const monthFilters: TimeframeFilter[] = spendingMonths.map((month) => ({
		id: `month_${month}`,
		value: month
	}));
	return [
		...yearFilters,
		{ id: 'last_6', value: '6' },
		{ id: 'last_12', value: '12' },
		...monthFilters
	];
}

export function getAllSpendingMonths(spendingsStore: CategorySpendingsStore): string[] {
	const allMonths = new Set<string>();
	for (const monthYear of spendingsStore.keys()) {
		allMonths.add(monthYear);
	}
	return Array.from(allMonths).sort((a, b) => b.localeCompare(a));
}

export function getFullSpendingYears(spendingsStore: CategorySpendingsStore): string[] {
	const fullYears = new Set<string>();
	for (const monthYear of spendingsStore.keys()) {
		fullYears.add(monthYear.slice(0, 4));
	}
	return Array.from(fullYears).sort((a, b) => b.localeCompare(a));
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
		return { total: 0, average: 0, averageTotal: 0 };
	}
	const total = totalSpendings.reduce((acc, value) => acc + value, 0);
	const average = total / totalSpendings.filter((sp) => sp !== 0).length;
	const averageTotal = total / totalSpendings.length;

	return { total, average, averageTotal };
}
