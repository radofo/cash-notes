<script lang="ts">
	import type { DebtWithProfile } from '../../types/debt';
	import DebtListItem from './DebtListItem.svelte';

	export let unsettledDebts: DebtWithProfile[];
</script>

<div class="flex flex-col gap-1">
	<h2 class="font-bold">✅ Bestätigt</h2>

	<ul class="w-full list-none">
		{#each unsettledDebts as debt}
			<DebtListItem {debt} />
		{/each}
	</ul>
</div>
