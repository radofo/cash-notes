<script lang="ts">
	import Badge from '../../components/Badge.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import ToApproveListItem from './DebtListItem.svelte';

	export let openDebts: DebtWithProfile[];
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<h2 class="font-medium">
			<Badge>Von dir ausgegeben</Badge>
		</h2>
	</div>
	<ul class="w-full list-none">
		{#each openDebts as debt}
			<ToApproveListItem {debt} />
		{/each}
	</ul>
</div>
