<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { X } from 'lucide-svelte';
	import type { CashGroup } from '../../types/supabase';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { toFloat } from '../../utils/currency';
	import { dateToDateString } from '../../utils/date';
	import BudgetChips from '../BudgetChips.svelte';
	import ButtonPlain from '../Button.svelte';
	import FormDialog from '../FormDialog/FormDialog.svelte';
	import Input from '../Input.svelte';
	import InputWithLabel from '../InputWithLabel.svelte';
	import Modal from '../Modal.svelte';
	import type { ApproveQueueItem, ApproveQueueValues } from './types';

	export let items: ApproveQueueItem[];
	export let open: boolean;
	export let title = 'Ausgaben Bestätigen';
	export let approveLabel = 'Bestätigen';
	/** Returns true on success; the parent then removes the item from `items`. */
	export let onApprove: (item: ApproveQueueItem, values: ApproveQueueValues) => Promise<boolean>;

	$: activeCashGroups = $cashGroupStore.filter((cashGroup) => cashGroup.is_active);
	$: activeItem = items[0];

	// Progress: the total is fixed when the modal opens, the position counts up
	let total = 0;
	let approvedCount = 0;
	let wasOpen = false;
	$: if (open !== wasOpen) {
		wasOpen = open;
		if (open) {
			total = items.length;
			approvedCount = 0;
		}
	}

	let approvingLoading = false;
	let showErrorModal = false;

	// Form
	let cfName = '';
	let cfTotalAmount = '';
	let cfGroup: CashGroup | undefined;
	let cfDate = dateToDateString(new Date());

	// Only reset the form when a different item becomes active, so background
	// reloads of `items` don't wipe the user's input
	let loadedItemId: string | undefined;
	$: if (open && activeItem?.id !== loadedItemId) {
		loadItem(activeItem);
	}
	$: if (open && items.length === 0) {
		open = false;
	}
	// Must come after the loadItem block: Svelte runs `$:` statements once per update in
	// source order, so declaring this earlier computed it from the previous (empty) amount
	$: totalAmountNumber = cfTotalAmount === '' ? 0 : toFloat(cfTotalAmount);

	function loadItem(item: ApproveQueueItem | undefined) {
		loadedItemId = item?.id;
		cfName = item?.name ?? '';
		cfTotalAmount = item?.amount != null ? item.amount.toString() : '';
		cfGroup = activeCashGroups[0];
		cfDate = item ? dateToDateString(new Date(item.date)) : dateToDateString(new Date());
	}

	async function approve() {
		if (!activeItem || !cfGroup || !cfName || !cfTotalAmount || approvingLoading) {
			return;
		}
		// Parse at submit time instead of relying on the reactive value
		const amount = toFloat(cfTotalAmount);
		if (!Number.isFinite(amount) || amount <= 0) {
			showErrorModal = true;
			return;
		}
		approvingLoading = true;
		let success = false;
		try {
			success = await onApprove(activeItem, {
				name: cfName,
				amount,
				cashGroup: cfGroup,
				date: cfDate
			});
		} catch (e) {
			console.error('Error approving item:', e);
		}
		if (success) {
			approvedCount += 1;
		} else {
			showErrorModal = true;
		}
		approvingLoading = false;
	}
</script>

<FormDialog bind:open on:submit={approve}>
	<span slot="header">
		<span class="block">{title}</span>
		<span class="block text-sm font-normal text-muted-foreground">
			{Math.min(approvedCount + 1, total)}/{total}
		</span>
	</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<div class="flex flex-col gap-3">
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={cfName} />
			</InputWithLabel>
			<InputWithLabel label="Betrag Gesamt">
				<Input inputType="number" bind:inputValue={cfTotalAmount} />
			</InputWithLabel>
			<InputWithLabel label="Budget">
				<BudgetChips cashGroups={activeCashGroups} bind:selected={cfGroup} />
			</InputWithLabel>
			<InputWithLabel label="Datum">
				<Input inputType="date" bind:inputValue={cfDate} />
			</InputWithLabel>
			{#if activeItem}
				<slot item={activeItem} totalAmount={totalAmountNumber} />
			{/if}
		</div>
		<div class="mt-4 flex flex-col gap-2">
			<Button
				class="bg-green-100 py-6 text-green-800 hover:bg-green-200"
				variant="default"
				type="submit"
			>
				{#if approvingLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					{approveLabel}
				{/if}
			</Button>
		</div>
	</div>
</FormDialog>

<Modal bind:showModal={showErrorModal}>
	<div slot="header" class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Speichern fehlgeschlagen</h2>
		<button on:click={() => (showErrorModal = false)} class="p-1" aria-label="Schließen">
			<X size={20} />
		</button>
	</div>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-muted-foreground">
			Die Ausgabe konnte nicht gespeichert werden. Bitte versuche es erneut.
		</p>
		<div class="flex justify-end">
			<ButtonPlain on:btnclick={() => (showErrorModal = false)}>OK</ButtonPlain>
		</div>
	</div>
</Modal>
