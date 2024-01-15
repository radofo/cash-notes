<script lang="ts">
	import type { CashFlow } from '../types/supabase';
	import { formatCurrency } from '../utils/currency';

	export let cashFlow: CashFlow;
	export let editCashFlow: (id: string) => Promise<void>;

	let cfDate: string = '';

	$: {
		if (cashFlow.date) {
			let day = new Date(cashFlow.date).getDate().toString();
			if (day.length < 2) day = '0' + day;
			cfDate = day;
		}
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	on:click={() => editCashFlow(cashFlow.id)}
	class="flex cursor-pointer items-center justify-between border-b py-2 last:border-0"
>
	<div class="flex gap-4">
		<span class="text-md grid w-10 place-items-center rounded-lg border border-dotted p-2"
			>{cfDate}</span
		>
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
