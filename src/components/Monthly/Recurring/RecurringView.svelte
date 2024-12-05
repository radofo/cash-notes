<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import type { RecCashFlow } from '../../../types/supabase';
	import { recCashFlowStore } from '../../../utils/cashGroup.store';
	import { displayCurrency } from '../../../utils/currency';
	import { getActiveTimeframe, sortCashFlowsByBudgetName } from '../../../utils/recurring';
	import List from '../../List.svelte';
	import ListItem from '../../ListItem.svelte';

	export let openEditRecurringModal: (recurringCf?: RecCashFlow) => void;

	export let onRecurringAddOpen: () => void;

	$: recCashFlows = $recCashFlowStore;
	$: incomeCashFlows = recCashFlows.filter((rec) => rec.isIncome);
	$: costCashFlow = recCashFlows.filter((rec) => !rec.isIncome);
	$: activeRecCashFlows = sortCashFlowsByBudgetName(
		costCashFlow.filter((rec) => getActiveTimeframe(rec)?.amount !== null)
	);
	$: inActiveRecCashFlows = sortCashFlowsByBudgetName(
		costCashFlow.filter((rec) => getActiveTimeframe(rec)?.amount === null)
	);
</script>

<div class="relative flex flex-col gap-10 pb-12">
	<button on:click={() => onRecurringAddOpen()} class="flex justify-end">
		<Plus size={24} />
	</button>
	{#if !activeRecCashFlows.length && !inActiveRecCashFlows.length && !incomeCashFlows.length}
		<div class="flex flex-col gap-2">
			<span class="text-md block pl-1 text-center">Keine wiederkehrenden Zahlungen</span>
		</div>
	{/if}
	{#if incomeCashFlows.length > 0}
		<div class="flex flex-col gap-1">
			<span class="text-md block pl-1 text-start font-bold">Monatliche Einnahmen</span>
			<List>
				{#each incomeCashFlows as incomeCashFlow}
					<ListItem on:itemClicked={() => openEditRecurringModal(incomeCashFlow)} itemType="main">
						<div class="flex flex-col">
							<span>{incomeCashFlow.name}</span>
							<span class="text-sm text-muted-foreground">Einnahmen</span>
						</div>
						<div class="relative flex items-center">
							<span>{displayCurrency({ amount: getActiveTimeframe(incomeCashFlow)?.amount })}</span>
						</div>
					</ListItem>
				{/each}
			</List>
		</div>
	{/if}
	{#if activeRecCashFlows.length > 0}
		<div class="flex flex-col gap-2">
			<span class="text-md block pl-1 text-start font-bold">Monatliche Ausgaben</span>
			<List>
				{#each activeRecCashFlows as activeCashFlow}
					<ListItem on:itemClicked={() => openEditRecurringModal(activeCashFlow)} itemType="main">
						<div class="flex flex-col">
							<span>{activeCashFlow.name}</span>
							<span class="text-sm text-muted-foreground"
								>{activeCashFlow.cash_group?.name ?? '-'}</span
							>
						</div>
						<div class="relative flex items-center">
							<span>{displayCurrency({ amount: getActiveTimeframe(activeCashFlow)?.amount })}</span>
						</div>
					</ListItem>
				{/each}
			</List>
		</div>
	{/if}
	{#if inActiveRecCashFlows.length > 0}
		<div class="flex flex-col gap-2">
			<span class="text-md block text-start font-bold">Inaktive mtl. Zahlungen</span>
			<List>
				{#each inActiveRecCashFlows as inActiveCashFlow}
					<ListItem on:itemClicked={() => openEditRecurringModal(inActiveCashFlow)} itemType="main">
						<div class="flex flex-col">
							<span>{inActiveCashFlow.name}</span>
							<span class="text-sm text-muted-foreground"
								>{inActiveCashFlow.cash_group?.name ?? '-'}</span
							>
						</div>
						<div class="relative flex items-center">
							<span
								>{displayCurrency({ amount: getActiveTimeframe(inActiveCashFlow)?.amount })}</span
							>
						</div>
					</ListItem>
				{/each}
			</List>
		</div>
	{/if}
</div>
