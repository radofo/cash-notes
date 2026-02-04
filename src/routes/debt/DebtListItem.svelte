<script lang="ts">
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
			<span class="text-md w-8 font-medium text-text-tertiary">{date.month}</span>
		</div>
		<div class="flex flex-col">
			<span class="text-md">
				{debt.name}
			</span>
			<span class="text-muted-foreground">
				{'von'}
				{debt.from?.full_name ?? '?'}
				{'/ für'}
				{debt.for?.full_name ?? '?'}
			</span>
		</div>
	</div>
	<div class="flex flex-col items-end font-mono">
		<span class="text-md">
			{formatCurrency(debt.amount)} €
		</span>
	</div>
</li>
