<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import MonthRangeSelector from './MonthRangeSelector.svelte';
	import MultiBudgetSelector from './MultiBudgetSelector.svelte';

	export let fromMonth: number;
	export let fromYear: number;
	export let toMonth: number | null;
	export let toYear: number | null;
	export let availableMonths: string[];
	export let budgets: string[];
	export let selectedBudgets: string[];

	const dispatch = createEventDispatcher<{
		monthRangeChange: {
			fromMonth: number;
			fromYear: number;
			toMonth: number | null;
			toYear: number | null;
		};
		budgetChange: { selectedBudgets: string[] };
	}>();

	function handleMonthRangeChange(
		event: CustomEvent<{
			fromMonth: number;
			fromYear: number;
			toMonth: number | null;
			toYear: number | null;
		}>
	) {
		dispatch('monthRangeChange', event.detail);
	}

	function handleBudgetChange(event: CustomEvent<{ selectedBudgets: string[] }>) {
		dispatch('budgetChange', event.detail);
	}
</script>

<div class="fixed bottom-[92px] left-0 right-0 z-40 flex justify-center">
	<div
		class="flex w-[600px] max-w-full items-center justify-center gap-3 border-b border-t border-border bg-background/95 px-2 py-2 backdrop-blur-sm"
	>
		<div class="flex items-center gap-3 overflow-x-auto">
			<MonthRangeSelector
				{fromMonth}
				{fromYear}
				{toMonth}
				{toYear}
				{availableMonths}
				on:change={handleMonthRangeChange}
			/>

			<div class="h-6 w-px bg-border" />

			<MultiBudgetSelector {budgets} {selectedBudgets} on:change={handleBudgetChange} />
		</div>
	</div>
</div>
