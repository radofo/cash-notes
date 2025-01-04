<script lang="ts">
	import type { CashFlow } from '../types/supabase';
	import { formatCurrency } from '../utils/currency';

	export let cashFlow: CashFlow;
	export let editCashFlow: (cashFlow: CashFlow) => void;
	export let showMonth: boolean = false;

	let cfDate: string = '';
	let cfMonth: string = '';

	$: {
		if (cashFlow.date) {
			let day = new Date(cashFlow.date).getDate().toString();
			if (day.length < 2) day = '0' + day;
			let month = (new Date(cashFlow.date).getMonth() + 1).toString();
			if (month.length < 2) month = '0' + month;
			cfDate = day;
			cfMonth = month;
		}
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	on:click={() => editCashFlow(cashFlow)}
	class="flex cursor-pointer items-center justify-between border-b py-2 last:border-0"
>
	<div class="flex items-start gap-2">
		<div class="flex flex-col">
			{#if showMonth}
				<span class="text-md w-8 font-medium">{cfDate}</span>
				<span class="text-md w-8 font-medium text-slate-400">{cfMonth}</span>
			{:else}
				<span class="w-8 text-lg font-medium">{cfDate}</span>
			{/if}
		</div>
		<div class="flex flex-col">
			<span class="text-md">
				{cashFlow.name}
			</span>
			<span class="text-slate-500">{cashFlow.cash_group?.name ?? 'Sonstige'}</span>
		</div>
	</div>
	<div class="flex items-center">
		<span class="text-md">
			{formatCurrency(cashFlow.amount)} €
		</span>
	</div>
</li>
