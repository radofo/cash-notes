<script lang="ts">
	import type { DebtWithProfile } from '../../types/debt';
	import { displayCurrency } from '../../utils/currency';
	import { debtOverview } from '../../utils/debt.helpers';

	export let debts: DebtWithProfile[];

	$: debtStats = debtOverview(debts);
</script>

{#if debtStats}
	<h2 class="flex flex-col">
		<span class="text-slate-600">
			{debtStats.for?.full_name}
			{'schuldet'}
			{debtStats.from?.full_name}
		</span>
		<span class="text-xl font-bold">{displayCurrency({ amount: debtStats.total })}</span>
	</h2>
{/if}
