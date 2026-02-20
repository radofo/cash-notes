<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Button from '../../components/Button.svelte';
	import GenericGridTable from '../../components/GenericGridTable.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import type { ReceiptItemWithSplit } from '../../types/receipt';
	import { displayCurrency } from '../../utils/currency';

	export let open: boolean;
	export let debt: DebtWithProfile | null;
	export let currentUserId: string;

	const dispatch = createEventDispatcher<{
		close: void;
	}>();

	// Determine if current user is the creator (from) or the debtor (for)
	$: isCreator = debt?.from_id === currentUserId;

	// Get the other person's name
	$: otherPersonName = isCreator ? debt?.for?.full_name : debt?.from?.full_name;

	// Get receipt data
	$: receipt = debt?.receipt;
	$: items = receipt?.items ?? [];

	// Calculate totals based on perspective
	// If I'm the creator: ownTotal is mine, friendTotal is theirs
	// If I'm the debtor: ownTotal (creator's) becomes theirs, friendTotal becomes mine (Du)
	$: myTotal = isCreator ? receipt?.ownTotal ?? 0 : receipt?.friendTotal ?? 0;
	$: theirTotal = isCreator ? receipt?.friendTotal ?? 0 : receipt?.ownTotal ?? 0;

	// Column headers based on perspective
	$: myColumnHeader = 'Du';
	$: theirColumnHeader = otherPersonName ?? 'Freund';
	$: tableColumns = [
		{ key: 'item', label: 'Artikel', align: 'left' as const, truncate: true },
		{ key: 'their', label: theirColumnHeader, align: 'right' as const, truncate: true },
		{ key: 'my', label: myColumnHeader, align: 'right' as const },
		{ key: 'total', label: 'Total', align: 'right' as const }
	];
	$: tableRows = items.map((item) => ({
		item: item.name,
		their: getTheirAmount(item) === 0 ? '-' : displayCurrency({ amount: getTheirAmount(item) }),
		my: getMyAmount(item) === 0 ? '-' : displayCurrency({ amount: getMyAmount(item) }),
		total: displayCurrency({ amount: item.totalPrice })
	}));

	// Get item amounts based on perspective
	function getMyAmount(item: ReceiptItemWithSplit): number {
		return isCreator ? item.ownAmount : item.friendAmount;
	}

	function getTheirAmount(item: ReceiptItemWithSplit): number {
		return isCreator ? item.friendAmount : item.ownAmount;
	}

	// Format date as dd.mm.yyyy
	$: formattedDate = (() => {
		if (!receipt?.date) return '';
		const d = new Date(receipt.date);
		const day = d.getDate().toString().padStart(2, '0');
		const month = (d.getMonth() + 1).toString().padStart(2, '0');
		const year = d.getFullYear();
		return `${day}.${month}.${year}`;
	})();

	function handleClose() {
		open = false;
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}
</script>

{#if open && debt && receipt}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
		on:click={handleBackdropClick}
	>
		<div class="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl bg-background shadow-xl">
			<!-- Header -->
			<div class="flex w-full items-start justify-between border-b px-4 py-4">
				<!-- Left: Store name and date -->
				<div class="flex flex-col gap-1">
					<span class="text-2xl font-bold">{receipt.storeName}</span>
					<span class="text-sm text-muted-foreground">{formattedDate}</span>
				</div>
				<!-- Right: Amounts -->
				<div class="flex flex-col items-end gap-1">
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">Gesamt</span>
						<span class="font-medium">{displayCurrency({ amount: receipt.total })}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">{theirColumnHeader}</span>
						<span class="font-medium">{displayCurrency({ amount: theirTotal })}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">{myColumnHeader}</span>
						<span class="font-medium">{displayCurrency({ amount: myTotal })}</span>
					</div>
				</div>
			</div>

			<!-- Items table -->
			<div class="flex-1 overflow-y-auto p-4">
				<GenericGridTable
					columns={tableColumns}
					rows={tableRows}
					gridTemplate="minmax(0,1fr) 5.5rem 5.5rem 5.5rem"
				/>
			</div>

			<!-- Action button -->
			<div class="flex border-t p-4">
				<Button fullWidth on:btnclick={handleClose}>OK</Button>
			</div>
		</div>
	</div>
{/if}
