<script lang="ts">
	import type { DebtAgreement } from '../../types/debt';

	export let is_accepted: DebtAgreement | undefined;

	$: statusClass =
		is_accepted === 'pending'
			? 'bg-slate-100 text-slate-700'
			: is_accepted === 'accepted'
			? 'bg-green-100 text-green-700'
			: 'bg-red-100 text-red-700';

	$: statusTextDeutsch =
		is_accepted === 'pending' ? 'Offen' : is_accepted === 'accepted' ? 'Akzeptiert' : 'Abgelehnt';
</script>

{#if is_accepted}
	<span class="rounded-md p-2 text-xs font-semibold {statusClass}">
		{statusTextDeutsch}
	</span>
{/if}
