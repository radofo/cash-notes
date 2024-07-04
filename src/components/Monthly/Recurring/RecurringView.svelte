<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import type { RecCashFlow } from '../../../types/supabase';
	import { recCashFlowStore } from '../../../utils/cashGroup.store';
	import { displayCurrency } from '../../../utils/currency';
	import { getActiveTimeframe } from '../../../utils/recurring';
	import List from '../../List.svelte';
	import ListItem from '../../ListItem.svelte';
	import RecurringModalAdd from './RecurringModalAdd.svelte';
	import RecurringModalEdit from './RecurringModalEdit.svelte';

	$: recCashFlows = $recCashFlowStore;
	$: incomeCashFlows = recCashFlows.filter((rec) => rec.isIncome);
	$: costCashFlow = recCashFlows.filter((rec) => !rec.isIncome);
	$: activeRecCashFlows = sortCashFlows(
		costCashFlow.filter((rec) => getActiveTimeframe(rec)?.amount !== null)
	);
	$: inActiveRecCashFlows = sortCashFlows(
		costCashFlow.filter((rec) => getActiveTimeframe(rec)?.amount === null)
	);

	let showEditRecurringModal: boolean = false;
	let showAddRecurringModal: boolean = false;
	let recurringToEdit: RecCashFlow | undefined;
	let hiddenShown = false;

	function sortCashFlows(cashFlows: RecCashFlow[]) {
		return [...cashFlows].sort((recA, recB) =>
			(recA.cash_group?.name?.toLowerCase() ?? '') > (recB.cash_group?.name?.toLowerCase() ?? '')
				? 1
				: -1
		);
	}

	function openEditRecurringModal(recurringCf?: RecCashFlow) {
		if (recurringCf) {
			recurringToEdit = recurringCf;
			showEditRecurringModal = true;
		}
	}
</script>

<div class="relative flex flex-col gap-12 pb-12">
	<RecurringModalEdit {recurringToEdit} bind:open={showEditRecurringModal} />
	<RecurringModalAdd bind:open={showAddRecurringModal} />
	{#if !activeRecCashFlows.length && !inActiveRecCashFlows.length && !incomeCashFlows.length}
		<div class="flex flex-col gap-2">
			<span class="text-md block pl-1 text-center">Keine wiederkehrenden Zahlungen</span>
		</div>
	{/if}
	{#if incomeCashFlows.length > 0}
		<div class="flex flex-col gap-2">
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
