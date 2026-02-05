<script lang="ts">
	import { CheckCheck, Clock, X } from 'lucide-svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import { formatCurrency } from '../../utils/currency';
	import { dateToDayAndMonthWithPadding } from '../../utils/date';

	export let debt: DebtWithProfile;
	export let isCurrentUser: boolean;
	export let status: 'unsettled' | 'toApprove' | 'unapproved' | 'rejected';

	$: date = dateToDayAndMonthWithPadding(debt.date);
</script>

<div class="flex w-full {isCurrentUser ? 'justify-end' : 'justify-start'} mb-3">
	<div class="flex flex-col gap-1">
		<div
			class="flex flex-col gap-1 rounded-xl bg-muted py-3 {isCurrentUser
				? 'items-end pl-3 pr-3'
				: 'items-start pl-3 pr-3'}"
		>
			<div class="flex {!isCurrentUser && 'flex-row-reverse'} items-baseline gap-2 text-sm">
				<span class="font-normal">{debt.name}</span>
				<span class="font-normal text-muted-foreground">
					{formatCurrency(debt.amount)} €
				</span>
			</div>
		</div>
		<div
			class="flex items-center gap-1 px-2 text-xs text-muted-foreground {isCurrentUser
				? 'flex-row-reverse'
				: ''}"
		>
			<span>{date.day}.{date.month}</span>
			{#if status === 'unsettled'}
				<CheckCheck size={14} class="text-green-600" />
			{:else if status === 'toApprove' || status === 'unapproved'}
				<Clock size={14} class="text-blue-600" />
			{:else if status === 'rejected'}
				<X size={14} class="text-red-600" />
			{/if}
		</div>
	</div>
</div>
