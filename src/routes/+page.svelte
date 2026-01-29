<script lang="ts">
	import { IconLoader } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import CashFlowModalEdit from '../components/CashFlow/CashFlowModalEdit.svelte';
	import CashFlowItem from '../components/CashFlowItem.svelte';
	import DefaultPageContent from '../components/DefaultPageContent.svelte';
	import ModalMonthSelector from '../components/ModalMonthSelector.svelte';
	import MonthlyBudgets from '../components/MonthlyBudgets.svelte';
	import { getCashFlows } from '../network/cash_flow';
	import { getCashGroups } from '../network/cash_group';
	import { getRecCashFlows } from '../network/rec_cash_flow';
	import type { CashFlow } from '../types/supabase';
	import { cashFlowStore } from '../utils/cashFlow.store';
	import { cashGroupStore, recCashFlowStore } from '../utils/cashGroup.store';
	import {
		getActiveTimeframe,
		getIncomeForMonth,
		getRecurringTotalForMonth
	} from '../utils/recurring';
	import type { PageData } from './$types';
	import { Settings } from 'lucide-svelte';
	import List from '../components/List.svelte';
	import ListItem from '../components/ListItem.svelte';
	import { displayCurrency } from '../utils/currency';
	import Badge from '../components/Badge.svelte';

	export let data: PageData;

	// Page
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	let pageLoading: boolean = true;

	$: cashFlows = $cashFlowStore;
	$: cashGroups = $cashGroupStore;
	$: recCashFlows = $recCashFlowStore;
	$: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: cashFlowFilters = activeCashGroups.map((cg) => cg.name);

	// Month Selector
	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();

	// Cash Flow Filters
	let selectedFilter: string | null = null;

	let totalIncome = 0;
	let totalFixCost = 0;

	// Cash Flow Edit Modal
	let cashFlowToEdit: CashFlow | undefined = undefined;
	let showEditModal: boolean = false;
	function openCashFlowModal(cashFlow: CashFlow) {
		cashFlowToEdit = cashFlow;
		showEditModal = true;
	}
	$: {
		if (!showEditModal) {
			cashFlowToEdit = undefined;
		}
	}

	onMount(async () => {
		pageLoading = true;
		cashGroupStore.set(await getCashGroups(supabase));
		recCashFlowStore.set(await getRecCashFlows(supabase));
		pageLoading = false;
	});

	$: {
		(async () => {
			cashFlowStore.set(await getCashFlows(supabase, selectedMonth, selectedYear));
		})();
	}

	$: {
		totalIncome = getIncomeForMonth({ month: selectedMonth, year: selectedYear }, recCashFlows);
		totalFixCost = getRecurringTotalForMonth(
			{ month: selectedMonth, year: selectedYear },
			recCashFlows
		);
	}

	$: sortedCashFlows = cashFlows.sort((a: CashFlow, b: CashFlow) => {
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

	$: filteredCashFlows =
		selectedFilter === null
			? sortedCashFlows
			: sortedCashFlows.filter((cf) => cf.cash_group?.name === selectedFilter);

	// Group cash flows by date
	$: groupedCashFlows = filteredCashFlows.reduce((groups, cashFlow) => {
		const date = cashFlow.date;
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(cashFlow);
		return groups;
	}, {} as Record<string, CashFlow[]>);

	// Format date for display
	function formatDateHeading(dateStr: string): string {
		const date = new Date(dateStr);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);

		// Compare year, month, and day
		const isSameDay = (d1: Date, d2: Date) =>
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate();

		if (isSameDay(date, today)) {
			return 'Heute';
		}
		if (isSameDay(date, yesterday)) {
			return 'Gestern';
		}

		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		return `${day}.${month}`;
	}

	async function getNewMonthData(month?: number, year?: number) {
		if (month !== undefined && year !== undefined) {
			selectedMonth = month;
			selectedYear = year;
		}
	}

	const activeFilterStyles = 'bg-chip-active text-chip-active-foreground';
</script>

<DefaultPageContent>
	<CashFlowModalEdit {cashFlowToEdit} bind:open={showEditModal} />
	<div class="flex w-[600px] max-w-full flex-col gap-6 px-4">
		<div class="flex flex-row items-center justify-between">
			<ModalMonthSelector
				on:monthChanged={(e) => getNewMonthData(e.detail?.selectedMonth, e.detail?.selectedYear)}
			/>
			<a href="/profile"> <Settings size={28} /></a>
		</div>
		<MonthlyBudgets
			{totalIncome}
			{totalFixCost}
			{cashFlows}
			recurring={recCashFlows}
			month={{ month: selectedMonth, year: selectedYear }}
			cashGroups={activeCashGroups}
		/>
		<div class="flex flex-col items-stretch justify-between gap-4">
			{#if pageLoading}
				<div class="mt-8 grid place-items-center">
					<IconLoader class="animate-spin text-center" />
				</div>
			{:else if !sortedCashFlows.length}
				<div class="mt-8 text-center">Noch keine Einträge für diesen Monat</div>
			{:else}
				<div class="text-md flex flex-row items-center justify-start gap-2 overflow-x-auto py-4">
					<button
						on:click={() => (selectedFilter = null)}
						class="whitespace-nowrap rounded-full bg-chip p-2 {!selectedFilter
							? activeFilterStyles
							: ''}">Alle</button
					>
					{#each cashFlowFilters as filter}
						<button
							on:click={() => (selectedFilter = filter)}
							class="whitespace-nowrap rounded-full bg-chip p-2 {selectedFilter === filter
								? activeFilterStyles
								: ''}">{filter}</button
						>
					{/each}
				</div>
				{#if !filteredCashFlows.length}
					<div class="mt-8 text-center">Noch keine Einträge für diese Kategorie</div>
				{:else}
					<div class="flex flex-col gap-6">
						{#each Object.entries(groupedCashFlows) as [date, cashFlowsForDay]}
							<div class="flex flex-col items-start gap-1">
								<Badge>{formatDateHeading(date)}</Badge>
								<List>
									{#each cashFlowsForDay as cashFlow}
										<ListItem on:itemClicked={() => openCashFlowModal(cashFlow)} itemType="main">
											<div class="flex flex-col">
												<span>{cashFlow.name}</span>
												<span class="text-sm text-muted-foreground"
													>{cashFlow.cash_group?.name ?? '-'}</span
												>
											</div>
											<div class="relative flex items-center">
												<span>{displayCurrency({ amount: cashFlow.amount })}</span>
											</div>
										</ListItem>
									{/each}
								</List>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</DefaultPageContent>
