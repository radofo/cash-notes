<script lang="ts">
	import type { CashFlow } from '../types/supabase';
	import { formatCurrency } from '../utils/currency';

	export let cashFlow: CashFlow;
	export let editCashFlow: (cashFlow: CashFlow) => void;
	export let showMonth: boolean = false;

	let cfDate: string = '';
	let cfDayOfWeek: string = '';
	let cfMonth: string = '';

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	$: {
		if (cashFlow.date) {
			const date = new Date(cashFlow.date);
			let day = date.getDate().toString();
			if (day.length < 2) day = '0' + day;
			let month = (date.getMonth() + 1).toString();
			if (month.length < 2) month = '0' + month;
			cfDate = day;
			cfDayOfWeek = dayNames[date.getDay()];
			cfMonth = month;
		}
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	on:click={() => editCashFlow(cashFlow)}
	class="flex cursor-pointer items-center justify-between border-b border-dashed py-2 font-mono text-sm tracking-tight last:border-0"
>
	<div class="flex items-center gap-3">
		<div class="flex h-10 w-8 flex-col items-center justify-center">
			<span class="font-semibold leading-tight">{cfDate}</span>
			<span class="text-xs leading-tight text-text-tertiary">{cfDayOfWeek}</span>
		</div>
		<div class="flex flex-col">
			<span>
				{cashFlow.name}
			</span>
			<span class="text-muted-foreground">{cashFlow.cash_group?.name ?? 'Sonstige'}</span>
		</div>
	</div>
	<div class="flex items-center font-mono">
		<span>
			{formatCurrency(cashFlow.amount)} €
		</span>
	</div>
</li>
