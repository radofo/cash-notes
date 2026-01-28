<script lang="ts">
	export let selectedFilter: string | null;
	export let cashFlowFilters: string[];
	export let onFilterChange: (filter: string | null) => void;

	let activeFilterStyles = 'text-chip-active-foreground bg-chip-active';
</script>

<div class="flex flex-row items-center justify-start gap-2 overflow-x-auto text-sm">
	<button
		on:click={() => onFilterChange(null)}
		class="whitespace-nowrap rounded-xl bg-chip px-2 py-1.5 {!selectedFilter
			? activeFilterStyles
			: ''}">Alle</button
	>
	{#each cashFlowFilters as filter}
		<button
			on:click={() => onFilterChange(filter)}
			class="whitespace-nowrap rounded-xl bg-chip px-2 py-1.5 {selectedFilter === filter
				? activeFilterStyles
				: ''}">{filter}</button
		>
	{/each}
</div>
