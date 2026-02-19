<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import type { Profile } from '../../types/friendship';
	import type { ParsedReceipt, ReceiptItem } from '../../types/receipt';
	import type { CashGroup } from '../../types/supabase';
	import { displayCurrency } from '../../utils/currency';
	import Button from '../Button.svelte';
	import Input from '../Input.svelte';
	import InputWithLabel from '../InputWithLabel.svelte';

	export let parsedReceipt: ParsedReceipt;
	export let cashGroups: CashGroup[];
	export let friends: Profile[];

	const dispatch = createEventDispatcher<{
		continue: {
			name: string;
			total: number;
			budgetId: string;
			date: string;
			friendId: string;
			items: ReceiptItem[];
		};
		close: void;
	}>();

	// Form values
	let name = parsedReceipt.storeName || '';
	let totalAmount = parsedReceipt.total?.toString() || '0';
	let selectedBudgetId = cashGroups[0]?.id || '';
	let date = parsedReceipt.date || new Date().toISOString().split('T')[0];
	let selectedFriendId = friends[0]?.id || '';

	$: totalNumber = Number.parseFloat(totalAmount) || 0;
	$: activeCashGroups = cashGroups.filter((cg) => cg.is_active);

	function handleContinue() {
		dispatch('continue', {
			name,
			total: totalNumber,
			budgetId: selectedBudgetId,
			date,
			friendId: selectedFriendId,
			items: parsedReceipt.items
		});
	}
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-background">
	<!-- Close button -->
	<div class="flex justify-end p-4">
		<button on:click={() => dispatch('close')} class="rounded-full p-1" aria-label="Schließen">
			<X size={20} />
		</button>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto p-4">
		<div class="flex flex-col gap-4">
			<!-- Form fields -->
			<InputWithLabel label="Name">
				<Input inputType="text" bind:inputValue={name} />
			</InputWithLabel>

			<InputWithLabel label="Gesamt">
				<Input inputType="number" bind:inputValue={totalAmount} />
			</InputWithLabel>

			<InputWithLabel label="Budget">
				<select
					bind:value={selectedBudgetId}
					class="w-full rounded-lg border border-input bg-background p-2 text-base"
				>
					{#each activeCashGroups as cashGroup}
						<option value={cashGroup.id}>{cashGroup.name}</option>
					{/each}
				</select>
			</InputWithLabel>

			<InputWithLabel label="Datum">
				<Input inputType="date" bind:inputValue={date} />
			</InputWithLabel>

			{#if friends.length > 0}
				<InputWithLabel label="Teilen mit">
					<select
						bind:value={selectedFriendId}
						class="w-full rounded-lg border border-input bg-background p-2 text-base"
					>
						{#each friends as friend}
							<option value={friend.id}>{friend.full_name}</option>
						{/each}
					</select>
				</InputWithLabel>
			{/if}

			<!-- Items list (read-only) -->
			<div class="mt-4">
				<!-- Table header -->
				<div class="flex border-b border-dashed border-muted-foreground p-3 text-sm font-medium">
					<span class="flex-1">Artikel</span>
					<span class="w-20 text-right">Preis</span>
				</div>

				<!-- Table rows -->
				{#each parsedReceipt.items as item, index}
					<div
						class="flex items-center p-3 {index < parsedReceipt.items.length - 1
							? 'border-b border-dashed border-muted-foreground'
							: ''}"
					>
						<span class="flex-1 text-sm">{item.name}</span>
						<span class="w-20 text-right text-sm"
							>{displayCurrency({ amount: item.totalPrice })}</span
						>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Action button -->
	<div class="flex justify-end border-t p-4 pb-10">
		<Button on:btnclick={handleContinue}>Weiter</Button>
	</div>
</div>
