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
	<div class="relative w-full rounded-lg bg-progress">
		<!-- Clipping wrapper for progress fill -->
		<div class="absolute inset-0 overflow-hidden rounded-lg">
			<!-- Progress fill -->
			<div
				class="absolute inset-y-0 left-0 bg-primary/40 transition-all duration-300"
				style="width: {spendingProgress}%"
			/>
		</div>

		<!-- Month progress indicator -->
		<div
			class="absolute bottom-0 h-0.5 translate-y-full rounded-b bg-progress-border"
			style="left: {monthProgress}%; width: 2px;"
		/>

		<!-- Content inside the bar -->
		<div
			class="text-md relative z-20 flex flex-row items-center justify-between px-3 py-2.5 text-foreground/70"
		>
			<span class="font-normal">{name}</span>
			<span class="font-normal tabular-nums">
				{formatCurrency(Math.round(info.spent))}{info.limit !== null
					? ` / ${displayCurrency({ amount: Math.round(info.limit), forceDecimals: false })}`
					: ''}
			</span>
		</div>
	</div>
</li>
