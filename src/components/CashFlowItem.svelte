<script lang="ts">
	import type { CashFlow } from '../types/supabase';

	export let cashFlow: CashFlow;
	export let editCashFlow: (id: string) => Promise<void>;

	let deleteLoading: boolean = false;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	on:click={() => editCashFlow(cashFlow.id)}
	class="flex cursor-pointer items-center justify-between border-b py-2 last:border-0"
>
	<div class="flex justify-stretch gap-4">
		<span class="text-md grid place-items-center rounded-lg border border-dashed p-2"
			>{new Date(cashFlow.date).getDate()}</span
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
			{cashFlow.amount.toFixed(2).replace('.', ',')} €
		</span>
	</div>
</li>
