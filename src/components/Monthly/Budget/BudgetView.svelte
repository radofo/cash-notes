<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import type { CashGroup } from '../../../types/supabase';
	import { cashGroupStore } from '../../../utils/cashGroup.store';
	import { displayCurrency } from '../../../utils/currency';
	import List from '../../List.svelte';
	import ListItem from '../../ListItem.svelte';

	export let openCashGroupEditModal: (cashGroup: CashGroup) => void;
	export let onBudgetAddOpen: () => void;

	// Store Values
	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: inactiveCashGroups = cashGroups.filter((cashGroup) => !cashGroup.is_active);
</script>

<div class="flex flex-col gap-8">
	<div class="flex flex-col gap-4">
		<button on:click={() => onBudgetAddOpen()} class="flex justify-end">
			<Plus size={24} />
		</button>
		{#if activeCashGroups.length === 0}
			<p class="mt-3 text-center text-slate-500">Keine aktiven Budgets vorhanden</p>
		{/if}
		<div class="flex flex-col gap-2">
			<span class="text-md block pl-1 text-start font-bold">Aktive Budgets</span>
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
	</div>
	{#if inactiveCashGroups.length > 0}
		<div class="flex flex-col gap-2">
			<span class="text-md block text-start font-semibold">Inaktive Budgets</span>
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
		</div>
	{/if}
</div>
