<script lang="ts">
	import type { BudgetProgress } from '../types/budget';
	import { displayCurrency, formatCurrency } from '../utils/currency';

	export let name: string;
	export let info: BudgetProgress;
	export let colorClass: string = 'progress-success';
	export let fontBold: boolean = false;
</script>

<li class="flex w-full flex-col {fontBold ? 'font-medium' : 'font-norma l'}">
	<div class="flex flex-row justify-between">
		<span>{name}</span>
		<span
			>{formatCurrency(info.spent)}
			{info.limit !== null ? `/ ${displayCurrency({ amount: info.limit })}` : ''}</span
		>
	</div>
	<progress
		class="{colorClass} progress w-full bg-slate-200 {info.limit !== null ? '' : 'opacity-30'}"
		value={(info?.limit ?? 0) > 0 ? Math.max(0, info.spent / (info.limit ?? 0)) * 100 : 100}
		max="100"
	/>
</li>
