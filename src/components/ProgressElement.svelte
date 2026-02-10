<script lang="ts">
	import type { BudgetViewMode } from '../stores/preferences';
	import type { BudgetProgress } from '../types/budget';
	import { displayCurrency, formatCurrency } from '../utils/currency';
	import { dayOfMonthPercentage } from '../utils/date';

	export let name: string;
	export let info: BudgetProgress;
	export let fontBold: boolean = false;
	export let viewMode: BudgetViewMode = 'spent';
	export let onClick: (() => void) | undefined = undefined;

	let dayProgress = dayOfMonthPercentage();

	// Calculate remaining budget (can be negative if overspent)
	$: remaining = (info.limit ?? 0) - info.spent;

	// Month progress indicator position adapts to view mode
	// Spent mode: shows how much you should have spent by now
	// Remaining mode: shows how much you should have left by now
	$: monthProgress = viewMode === 'spent' ? dayProgress : 100 - dayProgress;

	// Progress calculation based on view mode
	$: progressPercent =
		viewMode === 'spent'
			? Math.max(0, info.spent / (info.limit ?? 1)) * 100
			: Math.max(0, remaining / (info.limit ?? 1)) * 100;

	// Display value based on view mode
	$: displayValue = viewMode === 'spent' ? info.spent : remaining;
</script>

<li class="flex w-full flex-col {fontBold ? 'font-medium' : 'font-normal'}">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="relative w-full rounded-lg bg-progress {onClick ? 'cursor-pointer' : ''}"
		on:click={onClick}
	>
		<!-- Clipping wrapper for progress fill -->
		<div class="absolute inset-0 overflow-hidden rounded-lg">
			<!-- Progress fill -->
			<div
				class="absolute inset-y-0 left-0 bg-primary/40 transition-all duration-300"
				style="width: {progressPercent}%"
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
				{formatCurrency(Math.round(displayValue))}{info.limit !== null
					? ` / ${displayCurrency({ amount: Math.round(info.limit), forceDecimals: false })}`
					: ''}
			</span>
		</div>
	</div>
</li>
