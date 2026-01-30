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
	<div class="relative w-full overflow-hidden rounded-xl bg-progress">
		<!-- Progress fill -->
		<div
			class="absolute inset-y-0 left-0 rounded-xl bg-primary transition-all duration-300"
			style="width: {spendingProgress}%"
		/>

		<!-- Month progress indicator -->
		<div
			class="absolute bottom-0 h-1.5 rounded-t {monthProgress < spendingProgress
				? 'bg-primary-foreground/30'
				: 'bg-progress-border/50'}"
			style="left: {monthProgress}%; width: 3px;"
		/>

		<!-- Content inside the bar -->
		<div
			class="relative z-20 flex flex-row items-center justify-between px-3 py-2.5 text-foreground/70"
		>
			<span class="font-medium">{name}</span>
			<span class="font-medium tabular-nums">
				{formatCurrency(Math.round(info.spent))}{info.limit !== null
					? ` / ${displayCurrency({ amount: Math.round(info.limit), forceDecimals: false })}`
					: ''}
			</span>
		</div>
	</div>
</li>
