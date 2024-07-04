import { derived, writable } from 'svelte/store';
import type { CashGroup, RecCashFlow } from '../types/supabase';

const cashGroupStore = (() => {
	const { subscribe, set, update } = writable<CashGroup[]>([]);

	function insertCashGroup(cashGroup: CashGroup) {
		update((cashGroups) => {
			return [...cashGroups, cashGroup];
		});
	}

	function updateCashGroups(cashGroup: CashGroup) {
		update((cashGroups) => {
			const index = cashGroups.findIndex((cg) => cg.id === cashGroup.id);
			if (index === -1) {
				return cashGroups;
			}

			const updatedCashGroups = [...cashGroups];
			updatedCashGroups[index] = cashGroup;
			return updatedCashGroups;
		});
	}

	function removeCashGroup(cashGroupId: string) {
		update((cashGroups) => {
			return cashGroups.filter((cg) => cg.id !== cashGroupId);
		});
	}

	return {
		subscribe,
		set,
		update,
		updateCashGroups,
		removeCashGroup,
		insertCashGroup
	};
})();

const recCashFlowStore = (() => {
	const { subscribe, set, update } = writable<RecCashFlow[]>([]);

	function updateRecCashFlows(recCashFlow: RecCashFlow) {
		update((recCashFlows) => {
			const index = recCashFlows.findIndex((rcf) => rcf.id === recCashFlow.id);
			if (index === -1) {
				return recCashFlows;
			}

			const updatedRecCashFlows = [...recCashFlows];
			updatedRecCashFlows[index] = recCashFlow;
			return updatedRecCashFlows;
		});
	}

	function removeRecCashFlow(recCashFlowId: string) {
		update((recCashFlows) => {
			return recCashFlows.filter((rcf) => rcf.id !== recCashFlowId);
		});
	}

	function addRecCashFlow(recCashFlow: RecCashFlow) {
		update((recCashFlows) => {
			return [...recCashFlows, recCashFlow];
		});
	}

	return {
		subscribe,
		set,
		update,
		updateRecCashFlows,
		removeRecCashFlow,
		addRecCashFlow
	};
})();

const cashGroupWithRecCashFlowsStore = derived(
	[cashGroupStore, recCashFlowStore],
	([$cashGroupStore, $recCashFlowStore]) => {
		return $cashGroupStore.map((cashGroup) => ({
			...cashGroup,
			recCashFlows: $recCashFlowStore.filter(
				(recCashFlow) => recCashFlow.cash_group?.id === cashGroup.id
			)
		}));
	}
);

export { cashGroupStore, cashGroupWithRecCashFlowsStore, recCashFlowStore };
