<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	type GridTableAlign = 'left' | 'right';

	interface GridTableColumn {
		key: string;
		label: string;
		align?: GridTableAlign;
		truncate?: boolean;
	}

	type GridTableRow = Record<string, string>;

	export let columns: GridTableColumn[] = [];
	export let rows: GridTableRow[] = [];
	export let gridTemplate: string = 'minmax(0,1fr) 5.5rem 5.5rem 5.5rem';
	export let clickableRows = false;
	export let getRowAriaLabel: ((row: GridTableRow, index: number) => string) | null = null;
	export let rowTextSizeClass = 'text-sm';

	const dispatch = createEventDispatcher<{
		rowClick: { index: number; row: GridTableRow };
	}>();

	function getAlignClass(align: GridTableAlign = 'left') {
		return align === 'right' ? 'text-right' : 'text-left';
	}

	function getHeaderCellClass(column: GridTableColumn) {
		const classes = [getAlignClass(column.align)];
		if (column.truncate) {
			classes.push('truncate');
		}
		if (column.key === columns[0]?.key) {
			classes.push('min-w-0');
		}
		return classes.join(' ');
	}

	function getRowCellClass(column: GridTableColumn) {
		const classes = [getAlignClass(column.align), rowTextSizeClass];
		if (column.truncate) {
			classes.push('truncate');
		}
		if (column.key === columns[0]?.key) {
			classes.push('min-w-0');
		}
		return classes.join(' ');
	}

	function handleRowClick(index: number, row: GridTableRow) {
		if (!clickableRows) return;
		dispatch('rowClick', { index, row });
	}
</script>

<div>
	<div
		class="grid border-b border-dashed border-muted-foreground p-3 text-sm font-medium"
		style={`grid-template-columns: ${gridTemplate};`}
	>
		{#each columns as column}
			<span class={getHeaderCellClass(column)}>{column.label}</span>
		{/each}
	</div>

	{#each rows as row, index}
		{#if clickableRows}
			<button
				on:click={() => handleRowClick(index, row)}
				class="grid w-full items-center p-3 text-left transition-colors hover:bg-muted/30 {index <
				rows.length - 1
					? 'border-b border-dashed border-muted-foreground'
					: ''}"
				style={`grid-template-columns: ${gridTemplate};`}
				aria-label={getRowAriaLabel ? getRowAriaLabel(row, index) : `Zeile ${index + 1}`}
			>
				{#each columns as column}
					<span class={getRowCellClass(column)}>{row[column.key] ?? ''}</span>
				{/each}
			</button>
		{:else}
			<div
				class="grid w-full items-center p-3 {index < rows.length - 1
					? 'border-b border-dashed border-muted-foreground'
					: ''}"
				style={`grid-template-columns: ${gridTemplate};`}
			>
				{#each columns as column}
					<span class={getRowCellClass(column)}>{row[column.key] ?? ''}</span>
				{/each}
			</div>
		{/if}
	{/each}
</div>
