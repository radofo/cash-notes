<script lang="ts">
	import type { CashGroup } from '../types/supabase';

	export let cashGroups: CashGroup[];
	export let selected: CashGroup | undefined;
</script>

<div class="flex flex-wrap gap-2 text-sm">
	{#each cashGroups as cashGroup (cashGroup.id)}
		<button
			type="button"
			on:click={() => (selected = cashGroup)}
			aria-pressed={cashGroup.id === selected?.id}
			class="whitespace-nowrap rounded-full px-3 py-2 transition-colors {cashGroup.id === selected?.id
				? 'bg-chip-active text-chip-active-foreground'
				: 'bg-chip'}"
		>
			{cashGroup.name}
		</button>
	{/each}
</div>
