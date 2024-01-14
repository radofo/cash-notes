import type { CashGroupWithMeta, FormTimeframe } from '../types/recurring';
import type {
	CashGroup,
	RecCashFlow,
	RecTimeframe,
	RecTimeframeInsert,
	RecTimeframeUpdate
} from '../types/supabase';
import dayjs from 'dayjs';
import { getMonthAndYearFromDateString, monthToDateString } from './date';

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
		.reduce((total, curr) => {
			return total + curr;
		}, 0);
}

export function getActiveTimeframe(recCashFlow: RecCashFlow): RecTimeframe | undefined {
	const now = dayjs();
	const sortedTimeframes = recCashFlow.timeframes.toSorted((a, b) => {
		return new Date(a.start_date) > new Date(b.start_date) ? 1 : -1;
	});
	const oldestTimeframe = sortedTimeframes[0];
	if (!oldestTimeframe || dayjs(oldestTimeframe.start_date).isAfter(dayjs())) {
		return;
	}
	let activeRecTimeframe = sortedTimeframes[0];
	for (const timeframe of sortedTimeframes) {
		const startDate = dayjs(timeframe.start_date);
		if (startDate.isAfter(now)) {
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
		} else if (formTimeframe.id && timeframeDiff(formTimeframe, oldTimeframe)) {
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
		amount: parseInt(formTimeframe.amount),
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
		amount: parseFloat(formTimeframe.amount),
		owner,
		rec_cash_flow_id,
		start_date: monthToDateString(formTimeframe.startMonth, formTimeframe.startYear)
	};
}

function timeframeDiff(formTimeframe: FormTimeframe, oldTimeframe: RecTimeframe): boolean {
	const { amount, startMonth, startYear } = formTimeframe;
	const { amount: dbAmount, start_date } = oldTimeframe;
	const dbDate = getMonthAndYearFromDateString(start_date);
	return (
		parseFloat(amount) !== dbAmount || dbDate?.month !== startMonth || dbDate?.year !== startYear
	);
}
