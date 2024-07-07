import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import type { Month } from '../types/date';
import type {
	CashGroupWithMeta,
	FormTimeframe,
	RealTotalTableT,
	TotalTableT
} from '../types/recurring';
import type {
	CashFlow,
	CashGroup,
	RecCashFlow,
	RecTimeframe,
	RecTimeframeInsert,
	RecTimeframeUpdate
} from '../types/supabase';
import { getMonthAndYearFromDateString, monthToDateString } from './date';
dayjs.extend(objectSupport);

function sumUpSpendingMap(spendingMap: Map<string, number>): number {
	return Array.from(spendingMap.values()).reduce((acc, val) => acc + val, 0);
}

export function getRealTotalData(
	cashFlows: CashFlow[],
	allRecCashFlows: RecCashFlow[],
	month: Month
): RealTotalTableT {
	const fixedSpendings = new Map<string, number>();
	const budgetedSpendings = new Map<string, number>();
	const noBudgetSpendings = new Map<string, number>();

	for (const recCashFlow of allRecCashFlows) {
		const activeTimeframe = getActiveTimeframe(recCashFlow, month);
		if (!activeTimeframe) {
			continue;
		}
		const amount = activeTimeframe.amount ?? 0;
		const cashGroupName = recCashFlow.cash_group?.name;
		if (cashGroupName) {
			const currentMapEntry = fixedSpendings.get(cashGroupName) ?? 0;
			fixedSpendings.set(cashGroupName, currentMapEntry + amount);
		}
	}

	for (const cashFlow of cashFlows) {
		const { cash_group, amount } = cashFlow;
		if (!cash_group) continue;
		else if (cash_group.budget) {
			const currentMapEntry = budgetedSpendings.get(cash_group.name) ?? 0;
			budgetedSpendings.set(cash_group.name, currentMapEntry + amount);
		} else {
			const currentMapEntry = noBudgetSpendings.get(cash_group.name) ?? 0;
			noBudgetSpendings.set(cash_group.name, currentMapEntry + amount);
		}
	}
	const fixedTotal = sumUpSpendingMap(fixedSpendings);
	const budgetedTotal = sumUpSpendingMap(budgetedSpendings);
	const noBudgetTotal = sumUpSpendingMap(noBudgetSpendings);

	return {
		incomes: getIncomeForMonth(month, allRecCashFlows),
		expenses: {
			total: fixedTotal + budgetedTotal + noBudgetTotal,
			fixedCosts: {
				total: fixedTotal,
				fixedBudgets: fixedSpendings
			},
			budgets: { total: budgetedTotal, budgets: budgetedSpendings },
			noBudgets: { total: noBudgetTotal, budgets: noBudgetSpendings }
		}
	};
}

export function getTotalTableData(
	thisMonthsRecurring: RecCashFlow[],
	cashGroups: CashGroup[]
): TotalTableT {
	// Incomes
	const incomesRecurring = thisMonthsRecurring.filter(
		(rec) => rec.isIncome && getActiveTimeframe(rec) !== undefined
	);
	const incomeTotal = incomesRecurring.reduce((acc, rec) => {
		const activeTimeframe = getActiveTimeframe(rec);
		return acc + (activeTimeframe?.amount ?? 0);
	}, 0);

	// Fixed Cost
	const expensesRecurring = thisMonthsRecurring.filter((rec) => !rec.isIncome);
	const fixedCostMap = new Map<string, RecCashFlow[]>();
	let fixedCostTotal = 0;
	for (const recCashFlow of expensesRecurring) {
		const activeTimeframe = getActiveTimeframe(recCashFlow);
		if (activeTimeframe && recCashFlow.cash_group?.name) {
			const budgetName = recCashFlow.cash_group?.name;
			const budgetMapItem = fixedCostMap.get(budgetName);
			if (budgetMapItem) {
				budgetMapItem.push(recCashFlow);
			} else {
				fixedCostMap.set(budgetName, [recCashFlow]);
			}
			fixedCostTotal += activeTimeframe.amount ?? 0;
		}
	}

	// Budget Total
	const budgetedGroups = cashGroups.filter((group) => group.budget);
	const budgetsMap = new Map<string, number>();
	let budgetsTotal = 0;
	for (const group of budgetedGroups) {
		const budgetAmount = group.budget ?? 0;
		budgetsMap.set(group.name, budgetAmount);
		budgetsTotal += budgetAmount;
	}

	return {
		incomes: { total: incomeTotal, recurring: incomesRecurring },
		expenses: {
			total: fixedCostTotal + budgetsTotal,
			fixedCosts: { total: fixedCostTotal, budgets: fixedCostMap },
			budgets: { total: budgetsTotal, budgets: budgetsMap }
		}
	};
}

export function getIncomeForMonth(referenceDate: Month, recCashFlows: RecCashFlow[]): number {
	return recCashFlows.reduce((result, recCashFlow) => {
		if (!recCashFlow.isIncome) {
			return result;
		}
		const activeTimeframe = getActiveTimeframe(recCashFlow, referenceDate);
		return result + (activeTimeframe?.amount ?? 0);
	}, 0);
}

export function getRecurringTotalForMonth(
	referenceDate: Month,
	recCashFlows: RecCashFlow[]
): number {
	return recCashFlows.reduce((result, recCashFlow) => {
		if (recCashFlow.isIncome) {
			return result;
		}
		const activeTimeframe = getActiveTimeframe(recCashFlow, referenceDate);
		return result + (activeTimeframe?.amount ?? 0);
	}, 0);
}

export function addRecurringToCashGroups(
	initializedIncomeCashGroup: CashGroupWithMeta,
	initializedCashGroupsWithMeta: CashGroupWithMeta[],
	recurringCashFlows: RecCashFlow[]
): {
	newIncomeCashGroup: CashGroupWithMeta;
	newBudgetCashGroups: CashGroupWithMeta[];
	newNoBudgetCashGroups: CashGroupWithMeta[];
	newRecurringCashGroups: CashGroupWithMeta[];
} {
	const newIncomeCashGroup: CashGroupWithMeta = { ...initializedIncomeCashGroup };
	const newExpenseCashGroups: CashGroupWithMeta[] = [...initializedCashGroupsWithMeta]; // TODO: deep cloning

	for (const recCashFlow of recurringCashFlows) {
		const { isIncome, cash_group } = recCashFlow;
		const activeTimeframe = getActiveTimeframe(recCashFlow);
		const activeAmount = activeTimeframe?.amount ?? 0;

		if (isIncome) {
			newIncomeCashGroup.recurringCashFlows = [
				...newIncomeCashGroup.recurringCashFlows,
				{ recCashFlow, activeTimeframe }
			];
			newIncomeCashGroup.total = (newIncomeCashGroup?.total ?? 0) + (activeTimeframe?.amount ?? 0);
		}
		if (cash_group) {
			const expenseCashGroup = newExpenseCashGroups.find(
				(ecg) => ecg.cashGroup?.id === cash_group?.id
			);
			// TODO: handle rec_cash_flows without a cash_group
			if (expenseCashGroup) {
				expenseCashGroup.recurringCashFlows.push({ recCashFlow, activeTimeframe });
				if (!expenseCashGroup.cashGroup?.budget) {
					expenseCashGroup.total = (expenseCashGroup.total ?? 0) + activeAmount;
				}
			}
		}
	}
	const newBudgetCashGroups: CashGroupWithMeta[] = [];
	const newRecurringCashGroups: CashGroupWithMeta[] = [];
	const newNoBudgetCashGroups: CashGroupWithMeta[] = [];
	for (const expenseGroup of newExpenseCashGroups) {
		if (expenseGroup.cashGroup?.budget) {
			newBudgetCashGroups.push(expenseGroup);
		} else if (!expenseGroup.cashGroup?.budget && expenseGroup.total) {
			newRecurringCashGroups.push(expenseGroup);
		} else if (!expenseGroup.cashGroup?.budget && !expenseGroup.total) {
			newNoBudgetCashGroups.push(expenseGroup);
		}
	}
	return {
		newBudgetCashGroups,
		newIncomeCashGroup,
		newNoBudgetCashGroups,
		newRecurringCashGroups
	};
}

export function initGroups(cashGroups: CashGroup[]): CashGroupWithMeta[] {
	const initializedCashGroupsWithMeta: CashGroupWithMeta[] = [];

	for (const cashGroup of cashGroups) {
		initializedCashGroupsWithMeta.push({
			cashGroup,
			recurringCashFlows: [],
			total: cashGroup.budget ?? undefined
		});
	}

	return initializedCashGroupsWithMeta;
}

export function getCashGroupDetailsById(
	cashGroupsDetails: CashGroupWithMeta[],
	id: string
): CashGroupWithMeta | undefined {
	return cashGroupsDetails.find((cg) => cg.cashGroup?.id === id);
}

export function getCashGroupTotal(recCashFlows: RecCashFlow[], cashGroup?: CashGroup): number {
	if (cashGroup?.budget) return cashGroup.budget;

	return recCashFlows
		.map((rcf) => getActiveTimeframe(rcf))
		.filter((recTimeframe: RecTimeframe | undefined): recTimeframe is RecTimeframe =>
			Boolean(recTimeframe)
		)
		.map((rtf) => rtf.amount)
		.reduce((total: number, curr) => {
			return total + (curr ?? 0);
		}, 0);
}

export function getRecurringAmount(recCashFlow: RecCashFlow): number {
	const activeTimeframe = getActiveTimeframe(recCashFlow);
	return activeTimeframe?.amount ?? 0;
}

export function sortCashFlowsByAmount(cashFlows: RecCashFlow[]) {
	return [...cashFlows].sort((recA, recB) =>
		getRecurringAmount(recA) > getRecurringAmount(recB) ? -1 : 1
	);
}

export function sortCashFlowsByBudgetName(cashFlows: RecCashFlow[]) {
	return [...cashFlows].sort((recA, recB) =>
		(recA.cash_group?.name?.toLowerCase() ?? '') > (recB.cash_group?.name?.toLowerCase() ?? '')
			? 1
			: -1
	);
}

export function getActiveTimeframe(
	recCashFlow: RecCashFlow,
	referenceDate?: Month
): RecTimeframe | undefined {
	const referenceDay = referenceDate ? dayjs({ ...referenceDate, day: 1 }) : dayjs();
	const sortedTimeframes = recCashFlow.timeframes.toSorted((a, b) => {
		return new Date(a.start_date) > new Date(b.start_date) ? 1 : -1;
	});
	const oldestTimeframe = sortedTimeframes[0];
	if (!oldestTimeframe || dayjs(oldestTimeframe.start_date).isAfter(referenceDay, 'month')) {
		return;
	}
	let activeRecTimeframe = sortedTimeframes[0];
	for (const timeframe of sortedTimeframes) {
		const startDate = dayjs(timeframe.start_date);
		if (startDate.isAfter(referenceDay, 'month')) {
			break;
		}
		activeRecTimeframe = timeframe;
	}
	return activeRecTimeframe;
}

export function getRecCashFlowDiff(
	userId: string,
	oldCashFlow: RecCashFlow,
	formName: string,
	formIsIncome: boolean,
	formTimeframes: FormTimeframe[],
	formCashGroupId?: string
): {
	cashFlowChanged: boolean;
	timeframeInserted: RecTimeframeInsert[];
	timeframeUpdated: RecTimeframeUpdate[];
	timeframeDeleted: string[];
} {
	const { name, isIncome, cash_group, timeframes: oldTimeframes } = oldCashFlow;
	const formTimeframeMap = new Map(
		formTimeframes.map((formTf, index) => [formTf.id ?? `new_${index}`, formTf])
	);
	const oldTimeframeMap = new Map(
		oldTimeframes.map((formTf, index) => [formTf.id ?? `new_${index}`, formTf])
	);

	const timeframeInserted: RecTimeframeInsert[] = [];
	const timeframeUpdated: RecTimeframeUpdate[] = [];
	const timeframeDeleted: string[] = [];

	for (const [formTfId, formTimeframe] of formTimeframeMap) {
		const oldTimeframe = oldTimeframeMap.get(formTfId);
		if (!oldTimeframe) {
			timeframeInserted.push(formToInserted(formTimeframe, userId, oldCashFlow.id));
		} else if (formTimeframe.id && hasTimeFrameChanged(formTimeframe, oldTimeframe)) {
			timeframeUpdated.push(formToUpdated(formTimeframe, userId, formTimeframe.id, oldCashFlow.id));
		}
	}
	for (const [oldTfId] of oldTimeframeMap) {
		if (!formTimeframeMap.has(oldTfId)) {
			timeframeDeleted.push(oldTfId);
		}
	}

	const cashFlowChanged =
		name !== formName || isIncome !== formIsIncome || cash_group?.id !== formCashGroupId;

	return {
		cashFlowChanged,
		timeframeInserted,
		timeframeUpdated,
		timeframeDeleted
	};
}

export function formToUpdated(
	formTimeframe: FormTimeframe,
	owner: string,
	id: string,
	rec_cash_flow_id: string
): RecTimeframeUpdate {
	return {
		id,
		owner,
		amount: formTimeframe.amount !== null ? parseInt(formTimeframe.amount) : null,
		rec_cash_flow_id,
		start_date: monthToDateString(formTimeframe.startMonth, formTimeframe.startYear)
	};
}
export function formToInserted(
	formTimeframe: FormTimeframe,
	owner: string,
	rec_cash_flow_id: string
): RecTimeframeInsert {
	return {
		amount: formTimeframe.amount ? parseFloat(formTimeframe.amount) : null,
		owner,
		rec_cash_flow_id,
		start_date: monthToDateString(formTimeframe.startMonth, formTimeframe.startYear)
	};
}

function hasTimeFrameChanged(formTimeframe: FormTimeframe, oldTimeframe: RecTimeframe): boolean {
	const { amount, startMonth, startYear } = formTimeframe;
	const { amount: dbAmount, start_date } = oldTimeframe;
	const dbDate = getMonthAndYearFromDateString(start_date);
	return (
		parseFloat(amount) !== dbAmount || dbDate?.month !== startMonth || dbDate?.year !== startYear
	);
}

export function sortFormTimeframes(formTimeframes: FormTimeframe[]): FormTimeframe[] {
	return [...formTimeframes].sort((a, b) => {
		const aDate = new Date(a.startYear, a.startMonth);
		const bDate = new Date(b.startYear, b.startMonth);
		return aDate > bDate ? -1 : 1;
	});
}
