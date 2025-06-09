<script lang="ts">
	import Badge from '../../components/Badge.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import DebtListItem from './DebtListItem.svelte';

	export let unsettledDebts: DebtWithProfile[];
</script>

<div class="flex flex-col gap-2">
	<h2 class="font-medium">
		<Badge styles="bg-green-100 text-green-800">Bestätigt</Badge>
	</h2>

	<ul class="w-full list-none">
		{#each unsettledDebts as debt}
			<DebtListItem {debt} />
		{/each}
	</ul>
</div>
