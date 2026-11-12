<script lang="ts">
	import { friendsStore, noFriend } from '../../stores/friends';
	import type { Profile } from '../../types/friendship';
	import { displayCurrency } from '../../utils/currency';
	import Input from '../Input.svelte';
	import InputWithLabel from '../InputWithLabel.svelte';

	export let totalAmount: number;
	export let friend: Profile | undefined;
	export let friendAmount: string;

	$: friends = $friendsStore;
	$: friendAmountNumber = Number.parseFloat(friendAmount === '' ? '0' : friendAmount);
	$: ownAmountNumber = totalAmount - friendAmountNumber;
	$: friendAmountLabel = `Anteil ${friend?.full_name}`;

	function onFriendChange(newFriendId: string) {
		friend = friends.find((f) => f.id === newFriendId);
	}
</script>

{#if friends.length > 0}
	<div class="mt-5 flex flex-col gap-3 border-t border-dashed pt-5">
		<InputWithLabel label="Ausgabe Für">
			<select
				on:change={(e) => onFriendChange(e?.currentTarget?.value)}
				class="select w-full border border-input bg-background p-2 text-base"
			>
				{#each [noFriend, ...friends] as f}
					<option value={f.id} selected={f.id === friend?.id}>{f.full_name}</option>
				{/each}
			</select>
		</InputWithLabel>
		{#if friend && friend?.id !== noFriend.id}
			<InputWithLabel label={friendAmountLabel}>
				<Input inputType="number" bind:inputValue={friendAmount} />
			</InputWithLabel>
			{#if totalAmount >= friendAmountNumber}
				<div class="inline-grid w-fit grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
					<span>Dein Anteil:</span>
					<span>{displayCurrency({ amount: ownAmountNumber })}</span>
					<span>{friend.full_name}s Anteil:</span>
					<span>{displayCurrency({ amount: friendAmountNumber })}</span>
					<span class="font-medium">Gesamt:</span>
					<span class="font-medium">{displayCurrency({ amount: totalAmount })}</span>
				</div>
			{:else}
				<div class="text-xs text-red-500">
					Der Betrag für {friend.full_name} darf nicht größer sein als der Gesamtbetrag.
				</div>
			{/if}
		{/if}
	</div>
{/if}
