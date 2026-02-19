<script lang="ts">
	import { IconLoader } from '@tabler/icons-svelte';
	import { Settings } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { Camera } from 'lucide-svelte';
	import CashFlowModalEdit from '../components/CashFlow/CashFlowModalEdit.svelte';
	import DefaultPageContent from '../components/DefaultPageContent.svelte';
	import List from '../components/List.svelte';
	import ListItem from '../components/ListItem.svelte';
	import MonthlyBudgets from '../components/MonthlyBudgets.svelte';
	import PageHeaderCore from '../components/PageHeader/PageHeaderCore.svelte';
	import PageHeaderHeading from '../components/PageHeader/PageHeaderHeading.svelte';
	import { getCashFlows } from '../network/cash_flow';
	import { getCashGroups } from '../network/cash_group';
	import { getRecCashFlows } from '../network/rec_cash_flow';
	import type { CashFlow } from '../types/supabase';
	import { cashFlowStore } from '../utils/cashFlow.store';
	import { cashGroupStore, recCashFlowStore } from '../utils/cashGroup.store';
	import { displayCurrency } from '../utils/currency';
	import { getIncomeForMonth, getRecurringTotalForMonth } from '../utils/recurring';
	import type { PageData } from './$types';

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

	const monthNames = [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember'
	];

	$: monthYearDisplay = `${monthNames[selectedMonth]} ${selectedYear}`;

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

	// Format date for display in list items
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function getDateParts(dateStr: string): { day: string; dayOfWeek: string } {
		const date = new Date(dateStr);
		return {
			day: date.getDate().toString().padStart(2, '0'),
			dayOfWeek: dayNames[date.getDay()]
		};
	}

	const activeFilterStyles = 'bg-primary/40';
</script>

<DefaultPageContent>
	<CashFlowModalEdit {cashFlowToEdit} bind:open={showEditModal} />
	<div class="flex w-[600px] max-w-full flex-col px-4">
		<PageHeaderCore>
			<PageHeaderHeading slot="text">{monthYearDisplay}</PageHeaderHeading>
			<a slot="actions" href="/profile">
				<Settings size={20} class="cursor-pointer" />
			</a>
		</PageHeaderCore>
		<MonthlyBudgets
			{totalIncome}
			{totalFixCost}
			{cashFlows}
			recurring={recCashFlows}
			month={{ month: selectedMonth, year: selectedYear }}
			cashGroups={activeCashGroups}
		/>
		<div class="mt-6 flex flex-col items-stretch justify-between gap-4">
			{#if pageLoading}
				<div class="mt-8 grid place-items-center">
					<IconLoader class="animate-spin text-center" />
				</div>
			{:else if !sortedCashFlows.length}
				<div class="mt-8 text-center">Noch keine Einträge für diesen Monat</div>
			{:else}
				<div class="flex flex-row items-center justify-start gap-2 overflow-x-auto py-4 text-sm">
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
					<List>
						{#each filteredCashFlows as cashFlow}
							{@const dateParts = getDateParts(cashFlow.date)}
							<ListItem on:itemClicked={() => openCashFlowModal(cashFlow)} itemType="main">
								<div class="flex items-start gap-4">
									<div class="flex translate-y-[0.5px] flex-col items-center">
										<span class="text-lg font-medium leading-tight text-foreground/80"
											>{dateParts.day}</span
										>
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
			{/if}
		</div>
	</div>
	{#if !showEditModal}
		<a
			href="/receipt"
			class="fixed bottom-28 right-2 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
			aria-label="Kassenbon scannen"
		>
			<Camera size={24} />
		</a>
	{/if}
</DefaultPageContent>
