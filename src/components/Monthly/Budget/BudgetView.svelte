<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import type { CashGroup } from '../../../types/supabase';
	import { cashGroupStore } from '../../../utils/cashGroup.store';
	import { displayCurrency } from '../../../utils/currency';
	import List from '../../List.svelte';
	import ListItem from '../../ListItem.svelte';
	import BudgetModalEdit from './BudgetModalEdit.svelte';

	// Store Values
	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: inactiveCashGroups = cashGroups.filter((cashGroup) => !cashGroup.is_active);

	// Modals Management
	let showEditBudgetModal: boolean = false;
	let budgetToEdit: CashGroup | undefined;
	let hiddenShown = false;

	// Derived
	$: {
		if (!showEditBudgetModal) {
			budgetToEdit = undefined;
		}
	}

	// Functions
	function openCashGroupEditModal(cashGroup?: CashGroup) {
		if (cashGroup) {
			budgetToEdit = cashGroup;
			showEditBudgetModal = true;
		}
	}
</script>

<div class="flex flex-col gap-8">
	<BudgetModalEdit {budgetToEdit} bind:open={showEditBudgetModal} />
	<div class="flex flex-col gap-2">
		{#if activeCashGroups.length === 0}
			<p class="mt-3 text-center text-slate-500">Keine aktiven Budgets vorhanden</p>
		{/if}
		<List>
			{#each activeCashGroups as cashGroup}
				<ListItem on:itemClicked={() => openCashGroupEditModal?.(cashGroup)} itemType="main">
					<span class="border border-white border-opacity-0">
						{cashGroup.name}
					</span>
					<div class="relative flex items-center">
						<span class="">{displayCurrency({ amount: cashGroup.budget })}</span>
					</div>
				</ListItem>
			{/each}
		</List>
	</div>
	{#if inactiveCashGroups.length > 0}
		<Collapsible.Root bind:open={hiddenShown}>
			<Collapsible.Trigger class="flex w-full flex-row items-center justify-center gap-2">
				<span class="text-md block pl-6 text-start font-semibold">Inaktiv</span>
				{#if hiddenShown}
					<ChevronUp class="h-6 w-6" />
				{:else}
					<ChevronDown class="h-6 w-6" />
				{/if}
			</Collapsible.Trigger>
			<Collapsible.Content>
				<List>
					{#each inactiveCashGroups as cashGroup}
						<ListItem on:itemClicked={() => openCashGroupEditModal?.(cashGroup)} itemType="main">
							<span class="border border-white border-opacity-0">
								{cashGroup.name}
							</span>
							<div class="relative flex items-center">
								<span class="">{displayCurrency({ amount: cashGroup.budget })}</span>
							</div>
						</ListItem>
					{/each}
				</List>
			</Collapsible.Content>
		</Collapsible.Root>
	{/if}
</div>
