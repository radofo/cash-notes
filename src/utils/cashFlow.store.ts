import { writable } from 'svelte/store';
import type { CashFlow } from '../types/supabase';

const cashFlowStore = (() => {
	const { subscribe, set, update } = writable<CashFlow[]>([]);

	function insertCashFlow(newCashFlow: CashFlow) {
		update((cashFlows) => {
			return [...cashFlows, newCashFlow];
		});
	}

	function updateCashFlow(updatedCashFlow: CashFlow) {
		update((cashFlows) => {
			const index = cashFlows.findIndex((cg) => cg.id === updatedCashFlow.id);
			if (index === -1) {
				return cashFlows;
			}

			const updatedCashGroups = [...cashFlows];
			updatedCashGroups[index] = updatedCashFlow;
			return updatedCashGroups;
		});
	}

	function removeCashFlow(cashFlowId: string) {
		update((cashFlows) => {
			return cashFlows.filter((cg) => cg.id !== cashFlowId);
		});
	}

	return {
		subscribe,
		set,
		update,
		insertCashFlow,
		updateCashFlow,
		removeCashFlow
	};
})();

export { cashFlowStore };
