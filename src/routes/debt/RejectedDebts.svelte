<script lang="ts">
	import type { DebtWithProfile } from '../../types/debt';
	import DebtListItem from './DebtListItem.svelte';

	export let rejectedDebts: DebtWithProfile[];
</script>

<div class="flex flex-col gap-1">
	<div class="flex items-center justify-between">
		<h2 class="font-semibold">❌ Abgelehnt</h2>
	</div>
	<ul class="w-full list-none">
		{#each rejectedDebts as debt}
			<DebtListItem {debt} />
		{/each}
	</ul>
</div>
