<script lang="ts">
	export let selectedFilter: string | null;
	export let cashFlowFilters: string[];
	export let onFilterChange: (filter: string | null) => void;

	let activeFilterStyles = 'text-white bg-slate-500';
</script>

<div class="flex flex-row items-center justify-start gap-2 overflow-x-auto py-4 text-sm">
	<button
		on:click={() => onFilterChange(null)}
		class="whitespace-nowrap rounded-xl bg-slate-50 px-2 py-1.5 {!selectedFilter
			? activeFilterStyles
			: ''}">Alle</button
	>
	{#each cashFlowFilters as filter}
		<button
			on:click={() => onFilterChange(filter)}
			class="whitespace-nowrap rounded-xl bg-slate-50 px-2 py-1.5 {selectedFilter === filter
				? activeFilterStyles
				: ''}">{filter}</button
		>
	{/each}
</div>
