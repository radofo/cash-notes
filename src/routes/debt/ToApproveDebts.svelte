<script lang="ts">
	import Badge from '../../components/Badge.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import DebtListItem from './DebtListItem.svelte';

	export let toApproveDebts: DebtWithProfile[];
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<h2 class="font-medium">
			<Badge styles="bg-yellow-100 text-yellow-800">Für dich ausgegeben</Badge>
		</h2>
	</div>
	<ul class="w-full list-none">
		{#each toApproveDebts as debt}
			<DebtListItem {debt} />
		{/each}
	</ul>
</div>
