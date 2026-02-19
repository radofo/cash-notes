<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ReceiptItemWithSplit } from '../../types/receipt';
	import { displayCurrency } from '../../utils/currency';
	import Button from '../Button.svelte';

	export let items: ReceiptItemWithSplit[];
	export let total: number;
	export let friendName: string;
	export let storeName: string;
	export let date: string;

	const dispatch = createEventDispatcher<{
		done: void;
		close: void;
		editItem: number;
	}>();

	// Calculate totals
	$: friendTotal = items.reduce((sum, item) => sum + item.friendAmount, 0);
	$: ownTotal = items.reduce((sum, item) => sum + item.ownAmount, 0);

	// Format date as dd.mm.yyyy
	$: formattedDate = (() => {
		const d = new Date(date);
		const day = d.getDate().toString().padStart(2, '0');
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const year = d.getFullYear();
		return `${day}.${month}.${year}`;
	})();
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-background">
	<!-- Header -->
	<div class="flex w-full items-start justify-between border-b px-4 py-4">
		<!-- Left: Store name and date -->
		<div class="flex flex-col gap-1">
			<span class="text-2xl font-bold">{storeName}</span>
			<span class="text-sm text-muted-foreground">{formattedDate}</span>
		</div>
		<!-- Right: Amounts with labels -->
		<div class="flex flex-col items-end gap-1">
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Gesamt</span>
				<span class="font-medium">{displayCurrency({ amount: total })}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">{friendName}</span>
				<span class="font-medium">{displayCurrency({ amount: friendTotal })}</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Ich</span>
				<span class="font-medium">{displayCurrency({ amount: ownTotal })}</span>
			</div>
		</div>
	</div>

	<!-- Items table -->
	<div class="flex-1 overflow-y-auto p-4">
		<div>
			<!-- Table header -->
			<div class="flex border-b border-dashed border-muted-foreground p-3 text-sm font-medium">
				<span class="flex-1">Artikel</span>
				<span class="w-20 text-right">{friendName}</span>
				<span class="w-20 text-right">Du</span>
				<span class="w-20 text-right">Total</span>
			</div>

			<!-- Table rows (clickable) -->
			{#each items as item, index}
				<button
					on:click={() => dispatch('editItem', index)}
					class="flex w-full items-center p-3 text-left transition-colors hover:bg-muted/30 {index <
					items.length - 1
						? 'border-b border-dashed border-muted-foreground'
						: ''}"
					aria-label="Artikel {item.name} bearbeiten"
				>
					<span class="flex-1 text-sm">{item.name}</span>
					<span class="w-20 text-right text-sm"
						>{item.friendAmount === 0 ? '-' : displayCurrency({ amount: item.friendAmount })}</span
					>
					<span class="w-20 text-right text-sm">{displayCurrency({ amount: item.ownAmount })}</span>
					<span class="w-20 text-right text-sm">{displayCurrency({ amount: item.totalPrice })}</span
					>
				</button>
			{/each}
		</div>
	</div>

	<!-- Action buttons -->
	<div class="flex gap-3 border-t p-4 pb-10">
		<Button fullWidth variant="dashed" on:btnclick={() => dispatch('close')}>Abbrechen</Button>
		<Button fullWidth on:btnclick={() => dispatch('done')}>Fertig</Button>
	</div>
</div>
