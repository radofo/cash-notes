<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import GenericGridTable from '../GenericGridTable.svelte';
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
	$: tableColumns = [
		{ key: 'item', label: 'Artikel', align: 'left' as const, truncate: true },
		{ key: 'friend', label: friendName, align: 'right' as const, truncate: true },
		{ key: 'own', label: 'Du', align: 'right' as const },
		{ key: 'total', label: 'Total', align: 'right' as const }
	];
	$: tableRows = items.map((item) => ({
		item: `${item.name} and some more text to see`,
		friend: item.friendAmount === 0 ? '-' : displayCurrency({ amount: item.friendAmount }),
		own: displayCurrency({ amount: item.ownAmount }),
		total: displayCurrency({ amount: item.totalPrice })
	}));

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
		<GenericGridTable
			columns={tableColumns}
			rows={tableRows}
			gridTemplate="minmax(0,1fr) 5.5rem 5.5rem 5.5rem"
			clickableRows={true}
			getRowAriaLabel={(row) => `Artikel ${row.item} bearbeiten`}
			on:rowClick={(event) => dispatch('editItem', event.detail.index)}
		/>
	</div>

	<!-- Action buttons -->
	<div class="flex gap-3 border-t p-4 pb-10">
		<Button fullWidth variant="dashed" on:btnclick={() => dispatch('close')}>Abbrechen</Button>
		<Button fullWidth on:btnclick={() => dispatch('done')}>Fertig</Button>
	</div>
</div>
