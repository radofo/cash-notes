<script lang="ts">
	import Badge from '../../components/Badge.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import { formatCurrency } from '../../utils/currency';
	import { dateToDayAndMonthWithPadding } from '../../utils/date';

	export let debt: DebtWithProfile;

	$: date = dateToDayAndMonthWithPadding(debt.date);
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li class="flex cursor-pointer items-center justify-between border-b py-2 last:border-0">
	<div class="flex items-center gap-1">
		<div class="flex flex-col">
			<span class="text-md w-8 font-medium">{date.day}</span>
			<span class="text-md w-8 font-medium text-slate-400">{date.month}</span>
		</div>
		<div class="flex flex-col">
			<span class="text-md">
				{debt.name}
			</span>
			<span class="text-slate-500">
				{'von'}
				{debt.from?.full_name ?? '?'}
				{'/ für'}
				{debt.for?.full_name ?? '?'}
			</span>
		</div>
	</div>
	<div class="flex flex-col items-end">
		<span class="text-md">
			{formatCurrency(debt.amount)} €
		</span>
	</div>
</li>
