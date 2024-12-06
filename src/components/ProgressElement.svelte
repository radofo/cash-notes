<script lang="ts">
	import type { BudgetProgress } from '../types/budget';
	import { displayCurrency, formatCurrency } from '../utils/currency';
	import { dayOfMonthPercentage } from '../utils/date';

	export let name: string;
	export let info: BudgetProgress;
	export let fontBold: boolean = false;

	let monthProgress = dayOfMonthPercentage();
	$: spendingProgress = Math.max(0, info.spent / (info.limit ?? 1)) * 100;
</script>

<li class="flex w-full flex-col {fontBold ? 'font-medium' : 'font-normal'}">
	<div class="flex flex-row justify-between">
		<span>{name}</span>
		<span
			>{formatCurrency(info.spent)}
			{info.limit !== null ? `/ ${displayCurrency({ amount: info.limit })}` : ''}</span
		>
	</div>
	<div class="relative h-2 w-full overflow-hidden rounded bg-slate-200">
		<div class="absolute left-0 top-0 h-2 rounded bg-sky-600" style="width: {spendingProgress}%" />
		<div
			class="absolute bottom-0 top-0 rounded border {monthProgress > spendingProgress
				? 'border-sky-900'
				: 'border-slate-300'}"
			style="left: {monthProgress}%"
		/>
	</div>
</li>
