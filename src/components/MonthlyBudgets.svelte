<script lang="ts">
	import type { BudgetProgress, BudgetProgressMap } from '../types/budget';
	import type { CashFlow, CashGroup } from '../types/supabase';
	import ProgressElement from './ProgressElement.svelte';

	export let cashGroups: CashGroup[];
	export let cashFlows: CashFlow[];
	let progressWithBudget: Map<string, BudgetProgress>;
	let progressNoBudget: Map<string, BudgetProgress>;

	$: {
		const newProgressNoBudget = new Map<string, BudgetProgress>();
		const newProgressWithBudget = new Map<string, BudgetProgress>();
		for (const cashFlow of cashFlows) {
			const cashGroup = cashFlow.cash_group;
			if (!cashGroup) continue;

			if (cashGroup.name) {
				const newSpent =
					newProgressWithBudget.get(cashGroup.name ?? '')?.spent ?? 0 + cashFlow.amount;
				if (cashGroup.budget) {
					newProgressWithBudget.set(cashGroup.name, {
						limit: cashGroup.budget,
						spent: newSpent
					});
				} else {
					newProgressNoBudget.set(cashGroup.name, {
						limit: null,
						spent: newSpent
					});
				}
			}
		}
		for (const cashGroup of cashGroups) {
			if (!newProgressWithBudget.has(cashGroup.name) && cashGroup.budget) {
				newProgressWithBudget.set(cashGroup.name, { spent: 0, limit: cashGroup.budget });
			}
		}
		progressWithBudget = sortBudgets(newProgressWithBudget);
		progressNoBudget = sortBudgets(newProgressNoBudget);
	}

	function sortBudgets(progresses: BudgetProgressMap): BudgetProgressMap {
		return new Map(
			[...progresses].sort((a, b) => {
				const aSpent = a[1]?.spent ?? 0;
				const bSpent = b[1]?.spent ?? 0;
				return bSpent - aSpent;
			})
		);
	}
</script>

<ul class="flex flex-col gap-4">
	{#each [...progressWithBudget] as [name, info]}
		<ProgressElement {name} {info} />
	{/each}
	{#each [...progressNoBudget] as [name, info]}
		<ProgressElement {name} {info} />
	{/each}
</ul>
