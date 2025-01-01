<script lang="ts">
	import { Chart, registerables } from 'chart.js';
	import { onMount } from 'svelte';
	import BudgetFilter from '../../components/BudgetFilter.svelte';
	import { getCashGroups } from '../../network/cash_group';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import type { PageData } from './$types';
	import CostDevelopment from './CostDevelopment.svelte';

	Chart.register(...registerables);

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);

	let selectedFilter: string | null = null;
	let pageLoading: boolean = true;

	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: cashFlowFilters = activeCashGroups.map((cg) => cg.name);

	$: dataPointCategories = new Map<string | null, number[]>([
		[null, generateRandomNumbersBetween(0, 600, 12)],
		...cashFlowFilters.map((filter) => [filter, generateRandomNumbersBetween(100, 600, 12)])
	]);

	onMount(async () => {
		pageLoading = true;
		cashGroupStore.set(await getCashGroups(supabase));
		pageLoading = false;
	});

	function generateRandomNumbersBetween(min: number, max: number, count: number) {
		const numbers = [];
		for (let i = 0; i < count; i++) {
			numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
		}
		return numbers;
	}
</script>

<div class="px-1">
	<h1 class="text-center text-2xl font-bold">Kostenentwicklung</h1>
	<BudgetFilter
		{selectedFilter}
		{cashFlowFilters}
		onFilterChange={(filter) => (selectedFilter = filter)}
	/>
	<CostDevelopment
		labels={[
			'Jan 24',
			'Feb 24',
			'Mär 24',
			'Apr 24',
			'Mai 24',
			'Jun 24',
			'Jul 24',
			'Aug 24',
			'Sep 24',
			'Okt 24',
			'Nov 24',
			'Dez 24'
		]}
		dataPoints={dataPointCategories.get(selectedFilter) ?? []}
	/>
</div>
