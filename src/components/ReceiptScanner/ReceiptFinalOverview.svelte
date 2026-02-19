<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { ReceiptItemWithSplit } from '../../types/receipt';
	import { displayCurrency } from '../../utils/currency';
	import Button from '../Button.svelte';

	export let items: ReceiptItemWithSplit[];
	export let total: number;
	export let friendName: string;

	const dispatch = createEventDispatcher<{
		done: void;
		close: void;
		editItem: number;
	}>();

	// Calculate totals
	$: friendTotal = items.reduce((sum, item) => sum + item.friendAmount, 0);
	$: ownTotal = items.reduce((sum, item) => sum + item.ownAmount, 0);
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-background">
	<!-- Header -->
	<div class="flex items-center justify-between border-b p-4">
		<h2 class="text-lg font-semibold">Übersicht</h2>
		<button on:click={() => dispatch('close')} class="rounded-full p-1" aria-label="Schließen">
			<X size={20} />
		</button>
	</div>

	<!-- Top Summary -->
	<div class="flex flex-col gap-2 border-b bg-muted/30 p-4">
		<div class="flex items-center justify-between">
			<span class="text-sm text-muted-foreground">Gesamt</span>
			<span class="font-medium">{displayCurrency({ amount: total })}</span>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-sm text-muted-foreground">Eigener Betrag</span>
			<span class="font-medium text-primary">{displayCurrency({ amount: ownTotal })}</span>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-sm text-muted-foreground">Betrag {friendName}</span>
			<span class="font-medium">{displayCurrency({ amount: friendTotal })}</span>
		</div>
	</div>

	<!-- Items table -->
	<div class="flex-1 overflow-y-auto p-4">
		<div class="rounded-lg border">
			<!-- Table header -->
			<div class="flex border-b bg-muted/50 p-3 text-sm font-medium text-muted-foreground">
				<span class="flex-1">Artikel</span>
				<span class="w-24 text-right">Ich</span>
				<span class="w-24 text-right">{friendName}</span>
			</div>

			<!-- Table rows (clickable) -->
			{#each items as item, index}
				<button
					on:click={() => dispatch('editItem', index)}
					class="flex w-full items-center p-3 text-left transition-colors hover:bg-muted/30 {index <
					items.length - 1
						? 'border-b'
						: ''}"
					aria-label="Artikel {item.name} bearbeiten"
				>
					<span class="flex-1 text-sm">{item.name}</span>
					<span class="w-24 text-right text-sm">{displayCurrency({ amount: item.ownAmount })}</span>
					<span class="w-24 text-right text-sm"
						>{displayCurrency({ amount: item.friendAmount })}</span
					>
				</button>
			{/each}
		</div>
		<p class="mt-2 text-center text-xs text-muted-foreground">
			Tippe auf einen Artikel zum Bearbeiten
		</p>
	</div>

	<!-- Action button -->
	<div class="border-t p-4">
		<Button fullWidth on:btnclick={() => dispatch('done')}>Fertig</Button>
	</div>
</div>
