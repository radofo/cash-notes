<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import type { RecCashFlow } from '../../../types/supabase';
	import { recCashFlowStore } from '../../../utils/cashGroup.store';
	import { displayCurrency } from '../../../utils/currency';
	import { getActiveTimeframe, sortCashFlowsByBudgetName } from '../../../utils/recurring';
	import List from '../../List.svelte';
	import ListItem from '../../ListItem.svelte';

	export let openEditRecurringModal: (recurringCf?: RecCashFlow) => void;

	$: recCashFlows = $recCashFlowStore;
	$: incomeCashFlows = recCashFlows.filter((rec) => rec.isIncome);
	$: costCashFlow = recCashFlows.filter((rec) => !rec.isIncome);
	$: activeRecCashFlows = sortCashFlowsByBudgetName(
		costCashFlow.filter((rec) => getActiveTimeframe(rec)?.amount !== null)
	);
	$: inActiveRecCashFlows = sortCashFlowsByBudgetName(
		costCashFlow.filter((rec) => getActiveTimeframe(rec)?.amount === null)
	);

	let hiddenShown = false;
</script>

<div class="relative flex flex-col gap-8 pb-12">
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
		<Collapsible.Root bind:open={hiddenShown}>
			<Collapsible.Trigger class="flex w-full flex-row items-center justify-start gap-2">
				<span class="text-md block pl-1 text-start font-bold">Inaktiv</span>
				{#if hiddenShown}
					<ChevronUp class="h-6 w-6" />
				{:else}
					<ChevronDown class="h-6 w-6" />
				{/if}
			</Collapsible.Trigger>
			<Collapsible.Content>
				<List>
					{#each inActiveRecCashFlows as inActiveCashFlow}
						<ListItem
							on:itemClicked={() => openEditRecurringModal(inActiveCashFlow)}
							itemType="main"
						>
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
			</Collapsible.Content>
		</Collapsible.Root>
	{/if}
</div>
