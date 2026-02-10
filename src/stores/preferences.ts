import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export const obfuscate = writable(false);

// Budget view mode: 'spent' shows spent/budget (growing bars), 'remaining' shows left/budget (shrinking bars)
export type BudgetViewMode = 'spent' | 'remaining';

const BUDGET_VIEW_MODE_KEY = 'budgetViewMode';

function createBudgetViewModeStore() {
	const initialValue: BudgetViewMode = browser
		? (localStorage.getItem(BUDGET_VIEW_MODE_KEY) as BudgetViewMode) || 'spent'
		: 'spent';

	const { subscribe, set, update } = writable<BudgetViewMode>(initialValue);

	return {
		subscribe,
		set: (value: BudgetViewMode) => {
			if (browser) {
				localStorage.setItem(BUDGET_VIEW_MODE_KEY, value);
			}
			set(value);
		},
		toggle: () => {
			update((current) => {
				const newValue = current === 'spent' ? 'remaining' : 'spent';
				if (browser) {
					localStorage.setItem(BUDGET_VIEW_MODE_KEY, newValue);
				}
				return newValue;
			});
		}
	};
}

export const budgetViewMode = createBudgetViewModeStore();
