<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { CalendarDays } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import BudgetFilter from '../../components/BudgetFilter.svelte';
	import PageHeaderCore from '../../components/PageHeader/PageHeaderCore.svelte';
	import PageHeaderHeading from '../../components/PageHeader/PageHeaderHeading.svelte';
	import { getCashGroups } from '../../network/cash_group';
	import type {
		CategorySpendings,
		CategorySpendingsStore,
		DBSpendings,
		MonthLabels,
		TimeframeFilter
	} from '../../types/analysis';
	import type { CashGroup } from '../../types/supabase';
	import {
		createTimeframeLabel,
		getAllCashGroups,
		getAllSpendingMonths,
		getCategoriesMeta,
		getFullSpendingYears,
		getSpendingsMeta,
		getTimeframeCategorySpendings,
		getTimeframeFilters,
		getTotalSpendings,
		initCategorySpendingsStore
	} from '../../utils/analysis';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import type { PageData } from './$types';
	import CostDevelopment from './CostDevelopment.svelte';
	import CostDistribution from './CostDistribution.svelte';
	import InsightFacts from './InsightFacts.svelte';
	import TopSpendings from './TopSpendings.svelte';

	Chart.register(...registerables);

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let pageLoading: boolean = true;

	// All Data
	let categorySpendingsStore: CategorySpendingsStore = new Map();
	$: cashGroups = $cashGroupStore;
	// Filters
	let timeFrames: TimeframeFilter[] = [];
	let selectedTimeframe: TimeframeFilter | undefined;
	let allCategories: string[] = [];
	let selectedCategory: string | null = null;
	// Timeframe Data
	let xAxis: MonthLabels = [];
	let categorySpendings: CategorySpendings = new Map();
	$: categorySpendingsMeta = getCategoriesMeta(categorySpendings);
	$: allSpendings = getTotalSpendings(categorySpendings);
	// Selected Cash Group Data
	$: selectedSpendings = selectedCategory
		? categorySpendings.get(selectedCategory) ?? []
		: allSpendings;
	$: selectedSpendingsMeta = selectedCategory
		? categorySpendingsMeta.get(selectedCategory)
		: getSpendingsMeta(allSpendings);

	$: selectedCashGroups = selectedCategory
		? [cashGroups.find((cg) => cg.name === selectedCategory)].filter((cg): cg is CashGroup =>
				Boolean(cg)
		  )
		: cashGroups;
	$: selectedBudget = selectedCashGroups
		.filter((cg) => cg.is_active)
		.reduce((acc, cg) => acc + (cg?.budget ?? 0), 0);

	$: {
		if (selectedTimeframe) {
			const { spending, monthLabels } = getTimeframeCategorySpendings(
				categorySpendingsStore,
				selectedTimeframe,
				allCategories
			);
			categorySpendings = spending;
			xAxis = monthLabels;
		} else {
			categorySpendings = new Map();
			xAxis = [];
		}
	}

	onMount(async () => {
		pageLoading = true;
		const { data: rpcData, error } = await supabase.rpc('sum_cash_flows');
		allCategories = getAllCashGroups(rpcData);
		categorySpendingsStore = initCategorySpendingsStore(rpcData as DBSpendings);
		const fullSpendingYears = getFullSpendingYears(categorySpendingsStore);
		const fullSpendingMonths = getAllSpendingMonths(categorySpendingsStore);
		timeFrames = getTimeframeFilters(fullSpendingYears, fullSpendingMonths);
		selectedTimeframe = timeFrames.find((timeframe) => timeframe.id === 'last_12') ?? timeFrames[0];
		cashGroupStore.set(await getCashGroups(supabase));
		pageLoading = false;
	});
</script>

<div class="px-3 pb-10">
	<PageHeaderCore>
		<PageHeaderHeading slot="text">Analyse</PageHeaderHeading>
		<div slot="actions" class="dropdown dropdown-left">
			<div tabindex="0" role="button" class="flex flex-row items-center gap-2">
				<CalendarDays class="" size={16} />
				<span class="mt-1 text-sm font-medium">{createTimeframeLabel(selectedTimeframe)}</span>
			</div>
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<ul tabindex="0" class="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
				{#each timeFrames as timeframe}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<li on:click={() => (selectedTimeframe = timeframe)}>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a>{createTimeframeLabel(timeframe)}</a>
					</li>
				{/each}
			</ul>
		</div>
	</PageHeaderCore>
	<BudgetFilter
		selectedFilter={selectedCategory}
		cashFlowFilters={allCategories}
		onFilterChange={(filter) => (selectedCategory = filter)}
	/>
	<div class="mt-8 flex flex-col gap-12">
		{#if selectedSpendingsMeta}
			<InsightFacts
				isSingleMonth={selectedTimeframe?.id.startsWith('month_') ?? false}
				totalSpendings={selectedSpendingsMeta.total}
				averageSpendings={selectedSpendingsMeta.average}
				averageSpendingsTotal={selectedSpendingsMeta.averageTotal}
				budget={selectedBudget ?? 0}
			/>
		{/if}
		{#if !selectedTimeframe?.id.startsWith('month_')}
			<CostDevelopment labels={xAxis} dataPoints={selectedSpendings} />
		{/if}
		{#if selectedCategory === null}
			<CostDistribution spendingsMeta={categorySpendingsMeta} />
		{/if}
		<TopSpendings cashGroups={selectedCashGroups.map((cg) => cg.id)} months={xAxis} />
	</div>
</div>
