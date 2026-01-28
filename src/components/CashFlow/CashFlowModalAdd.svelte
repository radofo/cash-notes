<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import { insertCashFlow, isInMonth } from '../../network/cash_flow';
	import type { CashGroup } from '../../types/supabase';
	import { cashFlowStore } from '../../utils/cashFlow.store';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { dateToDateString } from '../../utils/date';
	import FormDialog from '../FormDialog/FormDialog.svelte';
	import Input from '../Input.svelte';
	import InputWithLabel from '../InputWithLabel.svelte';
	import { friendsStore, noFriend } from '../../stores/friends';
	import type { Profile } from '../../types/friendship';
	import { displayCurrency } from '../../utils/currency';
	import { insertDebtSupabase } from '../../network/debt';

	export let open: boolean;

	// Stores
	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((cashGroup) => cashGroup.is_active);
	$: supabase = $page.data.supabase;
	$: user = $page.data.session.user;
	$: friends = $friendsStore;

	// Form Variables
	let cfName: string = '';
	let cfTotalAmount: string = '';
	$: totalAmountNumber = Number.parseFloat(cfTotalAmount === '' ? '0' : cfTotalAmount);
	let cfGroup: CashGroup | undefined;
	let cfDate: string = dateToDateString(new Date());
	let cfFriend: Profile | undefined = undefined;
	let cfFriendAmount: string = '';
	$: friendAmountNumber = Number.parseFloat(cfFriendAmount === '' ? '0' : cfFriendAmount);
	$: ownAmountNumber = totalAmountNumber - friendAmountNumber;

	// Helper Variables
	$: friendAmountLabel = `Anteil ${cfFriend?.full_name}`;
	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();
	let modalCreateLoading: boolean = false;

	onMount(() => {
		cfGroup = activeCashGroups?.[0];
		cfFriend = noFriend;
	});

	async function submitNewCashFlow() {
		if (
			!user?.id ||
			!cfGroup?.id ||
			!cfName ||
			!cfTotalAmount ||
			ownAmountNumber < 0 ||
			totalAmountNumber < friendAmountNumber
		) {
			return;
		}
		modalCreateLoading = true;
		// Insert Debt
		let debtId: string | undefined = undefined;
		if (friendAmountNumber > 0 && cfFriend?.id) {
			const debt = await insertDebtSupabase(
				{
					amount: friendAmountNumber,
					name: cfName,
					date: cfDate,
					for_id: cfFriend.id,
					from_id: user.id
				},
				supabase
			);
			debtId = debt?.id;
		}
		// Insert Cash Flow
		if (ownAmountNumber > 0) {
			const newCashFlow = await insertCashFlow(
				{
					amount: ownAmountNumber,
					name: cfName,
					cash_group_id: cfGroup.id,
					date: cfDate,
					debt_id: debtId,
					owner: user.id
				},
				supabase
			);
			if (newCashFlow && isInMonth(newCashFlow, selectedMonth, selectedYear)) {
				cashFlowStore.insertCashFlow(newCashFlow);
			}
		}
		modalCreateLoading = false;
		open = false;
	}

	function oncfGroupChange(newGroupName: string) {
		cfGroup = activeCashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}
	function oncfFriendChange(newFriendId: string) {
		cfFriend = friends.find((friend) => friend.id === newFriendId);
	}
</script>

<FormDialog bind:open on:submit={submitNewCashFlow}>
	<span slot="header">Neue Ausgabe</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<div class="flex flex-col gap-3">
			<InputWithLabel label="Name">
				<Input autofocus={true} inputType="text" bind:inputValue={cfName} />
			</InputWithLabel>
			<InputWithLabel label="Betrag Gesamt">
				<Input inputType="number" bind:inputValue={cfTotalAmount} />
			</InputWithLabel>
			<InputWithLabel label="Budget">
				<select
					on:change={(e) => oncfGroupChange(e?.currentTarget?.value)}
					class="select w-full border border-input bg-background p-2 text-base"
				>
					{#each activeCashGroups as cashGroup}
						<option selected={cashGroup.id === cfGroup?.id}>{cashGroup.name}</option>
					{/each}
				</select>
			</InputWithLabel>
			<InputWithLabel label="Datum">
				<Input inputType="date" bind:inputValue={cfDate} />
			</InputWithLabel>
			<!-- DEBT	-->
			{#if friends.length > 0}
				<div class="mt-5 flex flex-col gap-3 border-t border-dashed pt-5">
					<InputWithLabel label="Ausgabe Für">
						<select
							on:change={(e) => oncfFriendChange(e?.currentTarget?.value)}
							class="select w-full border border-input bg-background p-2 text-base"
						>
							{#each [noFriend, ...friends] as friend}
								<option value={friend.id} selected={friend.id === cfFriend?.id}
									>{friend.full_name}</option
								>
							{/each}
						</select>
					</InputWithLabel>
					{#if cfFriend && cfFriend?.id !== noFriend.id}
						<InputWithLabel label={friendAmountLabel}>
							<Input inputType="number" bind:inputValue={cfFriendAmount} />
						</InputWithLabel>
						{#if totalAmountNumber >= friendAmountNumber}
							<div
								class="inline-grid w-fit grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground"
							>
								<span>Dein Anteil:</span>
								<span>{displayCurrency({ amount: ownAmountNumber })}</span>
								<span>{cfFriend.full_name}s Anteil:</span>
								<span>{displayCurrency({ amount: friendAmountNumber })}</span>
								<span class="font-medium">Gesamt:</span>
								<span class="font-medium">{displayCurrency({ amount: totalAmountNumber })}</span>
							</div>
						{:else}
							<div class="text-xs text-red-500">
								Der Betrag für {cfFriend.full_name} darf nicht größer sein als der Gesamtbetrag.
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
		<div class="mt-7 flex flex-col gap-2">
			<Button class="py-6" variant="default" type="submit">
				{#if modalCreateLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					Speichern
				{/if}
			</Button>
			<Button class="py-6" variant="secondary" on:click={() => (open = false)}>Abbrechen</Button>
		</div>
	</div>
</FormDialog>
