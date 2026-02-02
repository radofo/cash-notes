<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { IconLoader } from '@tabler/icons-svelte';
	import CashFlowModalEdit from '../../components/CashFlow/CashFlowModalEdit.svelte';
	import List from '../../components/List.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import MonthlyBudgets from '../../components/MonthlyBudgets.svelte';
	import { getCashFlows } from '../../network/cash_flow';
	import { getCashGroups } from '../../network/cash_group';
	import { getRecCashFlows } from '../../network/rec_cash_flow';
	import type { Month } from '../../types/date';
	import type { CashFlow } from '../../types/supabase';
	import { cashFlowStore } from '../../utils/cashFlow.store';
	import { cashGroupStore, recCashFlowStore } from '../../utils/cashGroup.store';
	import { displayCurrency } from '../../utils/currency';
	import { getIncomeForMonth, getRecurringTotalForMonth } from '../../utils/recurring';

	export let supabase: SupabaseClient;
	export let month: Month;
	export let selectedBudgets: string[] = [];

	let pageLoading = true;

	$: cashFlows = $cashFlowStore;
	$: cashGroups = $cashGroupStore;
	$: recCashFlows = $recCashFlowStore;

	// Filter cash groups based on selected budgets
	$: activeCashGroups =
		selectedBudgets.length > 0
			? cashGroups.filter((cg) => cg.is_active && selectedBudgets.includes(cg.name))
			: cashGroups.filter((cg) => cg.is_active);

	// Filter cash flows based on selected budgets
	$: filteredCashFlowsByBudget =
		selectedBudgets.length > 0
			? cashFlows.filter((cf) => cf.cash_group && selectedBudgets.includes(cf.cash_group.name))
			: cashFlows;

	let totalIncome = 0;
	let totalFixCost = 0;

	// Cash Flow Edit Modal
	let cashFlowToEdit: CashFlow | undefined = undefined;
	let showEditModal = false;

	function openCashFlowModal(cashFlow: CashFlow) {
		cashFlowToEdit = cashFlow;
		showEditModal = true;
	}

	$: {
		if (!showEditModal) {
			cashFlowToEdit = undefined;
		}
	}

	$: {
		totalIncome = getIncomeForMonth(month, recCashFlows);
		totalFixCost = getRecurringTotalForMonth(month, recCashFlows);
	}

	$: sortedCashFlows = filteredCashFlowsByBudget.sort((a: CashFlow, b: CashFlow) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		const createdA = new Date(a.createdAt);
		const createdB = new Date(b.createdAt);
		if (dateA > dateB) {
			return -1;
		} else if (dateB > dateA) {
			return 1;
		} else if (dateB === dateA) {
			return createdA > createdB ? -1 : 1;
		}
		return 0;
	});

	// Format date for display in list items
	const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

	function getDateParts(dateStr: string): { day: string; dayOfWeek: string } {
		const date = new Date(dateStr);
		return {
			day: date.getDate().toString().padStart(2, '0'),
			dayOfWeek: dayNames[date.getDay()]
		};
	}

	// Load data when month changes
	async function loadMonthData() {
		pageLoading = true;
		cashFlowStore.set(await getCashFlows(supabase, month.month, month.year));
		if ($cashGroupStore.length === 0) {
			cashGroupStore.set(await getCashGroups(supabase));
		}
		if ($recCashFlowStore.length === 0) {
			recCashFlowStore.set(await getRecCashFlows(supabase));
		}
		pageLoading = false;
	}

	// React to month changes
	$: if (month) {
		loadMonthData();
	}
</script>

<CashFlowModalEdit {cashFlowToEdit} bind:open={showEditModal} />

<div class="flex flex-col gap-10">
	{#if pageLoading}
		<div class="mt-8 grid place-items-center">
			<IconLoader class="animate-spin text-center" />
		</div>
	{:else}
		<!-- Budget bars and totals stacked (not carousel) for insights page -->
		<div>
			<MonthlyBudgets
				{totalIncome}
				{totalFixCost}
				cashFlows={filteredCashFlowsByBudget}
				recurring={recCashFlows}
				{month}
				cashGroups={activeCashGroups}
				stackedLayout={true}
			/>
		</div>

		<!-- Expenses list -->
		<div>
			<h3 class="mb-3 text-sm font-medium">Alle Ausgaben</h3>
			<div class="flex flex-col items-stretch justify-between gap-4">
				{#if !sortedCashFlows.length}
					<div class="mt-4 text-center text-text-secondary">Keine Ausgaben für diesen Monat</div>
				{:else if !sortedCashFlows.length}
					<div class="mt-4 text-center text-text-secondary">Keine Einträge für diese Kategorie</div>
				{:else}
					<List>
						{#each sortedCashFlows as cashFlow}
							{@const dateParts = getDateParts(cashFlow.date)}
							<ListItem on:itemClicked={() => openCashFlowModal(cashFlow)} itemType="main">
								<div class="flex items-start gap-4">
									<div class="flex translate-y-[0.5px] flex-col items-center">
										<span class="text-lg font-semibold leading-tight">{dateParts.day}</span>
										<span class="text-xs leading-tight text-text-tertiary"
											>{dateParts.dayOfWeek}</span
										>
									</div>
									<div class="flex flex-col">
										<span>{cashFlow.name}</span>
										<span class="text-muted-foreground">{cashFlow.cash_group?.name ?? '-'}</span>
									</div>
								</div>
								<div class="relative flex items-center">
									<span>{displayCurrency({ amount: cashFlow.amount })}</span>
								</div>
							</ListItem>
						{/each}
					</List>
				{/if}
			</div>
		</div>
	{/if}
</div>
