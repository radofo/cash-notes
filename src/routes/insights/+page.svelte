<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import PageHeaderCore from '../../components/PageHeader/PageHeaderCore.svelte';
	import PageHeaderHeading from '../../components/PageHeader/PageHeaderHeading.svelte';
	import { getCashGroups } from '../../network/cash_group';
	import type {
		CategorySpendings,
		CategorySpendingsStore,
		DBSpendings,
		MonthLabels,
		MonthRange
	} from '../../types/analysis';
	import type { Month } from '../../types/date';
	import {
		getAllCashGroups,
		getAllSpendingMonths,
		getCategoriesMeta,
		getDefaultMonthRange,
		getMonthRangeCategorySpendings,
		getSpendingsMeta,
		getTotalSpendings,
		initCategorySpendingsStore
	} from '../../utils/analysis';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { months } from '../../utils/date';
	import type { PageData } from './$types';
	import CostDevelopment from './CostDevelopment.svelte';
	import CostDistribution from './CostDistribution.svelte';
	import InsightFacts from './InsightFacts.svelte';
	import InsightsFilterBar from './InsightsFilterBar.svelte';
	import SingleMonthView from './SingleMonthView.svelte';
	import TopSpendings from './TopSpendings.svelte';

	Chart.register(...registerables);

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let pageLoading: boolean = true;

	// All Data
	let categorySpendingsStore: CategorySpendingsStore = new Map();
	$: cashGroups = $cashGroupStore;

	// Month range filter
	let monthRange: MonthRange = getDefaultMonthRange();
	let availableMonths: string[] = [];

	// Budget filter (multi-select)
	let allCategories: string[] = [];
	let selectedBudgets: string[] = [];

	// Timeframe Data
	let xAxis: MonthLabels = [];
	let categorySpendings: CategorySpendings = new Map();
	$: categorySpendingsMeta = getCategoriesMeta(categorySpendings);
	$: allSpendings = getTotalSpendings(categorySpendings);

	// Check if it's a single month view
	$: isSingleMonth =
		monthRange.toMonth === null ||
		(monthRange.fromMonth === monthRange.toMonth && monthRange.fromYear === monthRange.toYear);

	// Get the single month as Month type for SingleMonthView
	$: singleMonth = {
		month: monthRange.fromMonth,
		year: monthRange.fromYear
	} as Month;

	// Format header title based on month range
	$: headerTitle = isSingleMonth
		? `${months[monthRange.fromMonth]} ${monthRange.fromYear}`
		: `${months[monthRange.fromMonth]} ${monthRange.fromYear} - ${
				months[monthRange.toMonth ?? monthRange.fromMonth]
		  } ${monthRange.toYear ?? monthRange.fromYear}`;

	// Selected budget data
	$: selectedSpendingsMeta = getSpendingsMeta(allSpendings);

	$: selectedCashGroups =
		selectedBudgets.length > 0
			? cashGroups.filter((cg) => selectedBudgets.includes(cg.name))
			: cashGroups;

	$: selectedBudget = selectedCashGroups
		.filter((cg) => cg.is_active)
		.reduce((acc, cg) => acc + (cg?.budget ?? 0), 0);

	$: {
		if (categorySpendingsStore.size > 0) {
			const { spending, monthLabels } = getMonthRangeCategorySpendings(
				categorySpendingsStore,
				monthRange,
				allCategories,
				selectedBudgets
			);
			categorySpendings = spending;
			xAxis = monthLabels;
		} else {
			categorySpendings = new Map();
			xAxis = [];
		}
	}

	function handleMonthRangeChange(
		event: CustomEvent<{
			fromMonth: number;
			fromYear: number;
			toMonth: number | null;
			toYear: number | null;
		}>
	) {
		monthRange = event.detail;
	}

	function handleBudgetChange(event: CustomEvent<{ selectedBudgets: string[] }>) {
		selectedBudgets = event.detail.selectedBudgets;
	}

	onMount(async () => {
		pageLoading = true;
		const { data: rpcData, error } = await supabase.rpc('sum_cash_flows');
		allCategories = getAllCashGroups(rpcData);
		selectedBudgets = [...allCategories]; // Default: all budgets selected
		categorySpendingsStore = initCategorySpendingsStore(rpcData as DBSpendings);
		availableMonths = getAllSpendingMonths(categorySpendingsStore);
		cashGroupStore.set(await getCashGroups(supabase));
		pageLoading = false;
	});
</script>

<div class="px-3 pb-32">
	<PageHeaderCore>
		<PageHeaderHeading slot="text">{headerTitle}</PageHeaderHeading>
	</PageHeaderCore>

	<div class="mt-4 flex flex-col gap-20">
		{#if isSingleMonth}
			<!-- Single month view: show home-page style layout -->
			<SingleMonthView {supabase} month={singleMonth} {selectedBudgets} />
		{:else}
			<!-- Multi-month view: show charts and analytics -->
			{#if selectedSpendingsMeta}
				<InsightFacts
					{isSingleMonth}
					totalSpendings={selectedSpendingsMeta.total}
					averageSpendings={selectedSpendingsMeta.average}
					averageSpendingsTotal={selectedSpendingsMeta.averageTotal}
					budget={selectedBudget ?? 0}
				/>
			{/if}
			<CostDevelopment labels={xAxis} dataPoints={allSpendings} />
			{#if selectedBudgets.length === allCategories.length || selectedBudgets.length === 0}
				<CostDistribution spendingsMeta={categorySpendingsMeta} />
			{/if}
			<TopSpendings cashGroups={selectedCashGroups.map((cg) => cg.id)} months={xAxis} />
		{/if}
	</div>
</div>

<InsightsFilterBar
	fromMonth={monthRange.fromMonth}
	fromYear={monthRange.fromYear}
	toMonth={monthRange.toMonth}
	toYear={monthRange.toYear}
	{availableMonths}
	budgets={allCategories}
	{selectedBudgets}
	on:monthRangeChange={handleMonthRangeChange}
	on:budgetChange={handleBudgetChange}
/>
