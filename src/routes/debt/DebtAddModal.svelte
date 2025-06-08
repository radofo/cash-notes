<script lang="ts">
	import FormDialog from '../../components/FormDialog/FormDialog.svelte';
	import Input from '../../components/Input.svelte';
	import { friendsStore, noFriend } from '../../stores/friends';
	import InputWithLabel from '../../components/InputWithLabel.svelte';
	import type { Profile } from '../../types/friendship';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { toFloat } from '../../utils/currency';
	import { page } from '$app/stores';
	import { insertDebtSupabase } from '../../network/debt';
	import { dateToDateString } from '../../utils/date';
	import type { DebtWithProfile } from '../../types/debt';

	export let open: boolean;
	export let onDebtAdded: (debt: DebtWithProfile) => void;

	$: user = $page.data.session.user;
	$: supabase = $page.data.supabase;
	$: me = {
		id: user.id,
		full_name: 'Ich',
		createdAt: '',
		profile_image: null
	} as Profile;
	$: friends = [...$friendsStore, me];

	let debtName: string = '';
	let debtTotalAmount: string = '';
	let forUser: Profile | undefined = undefined;
	let fromUser: Profile | undefined = undefined;
	let modalAddLoading: boolean = false;

	onMount(() => {
		forUser = friends[0];
		fromUser = me;
	});

	async function submitNewDebt() {
		modalAddLoading = true;
		const friendAmountNumber = toFloat(debtTotalAmount);
		if (friendAmountNumber > 0 && forUser?.id && fromUser?.id && forUser.id !== fromUser.id) {
			const debt = await insertDebtSupabase(
				{
					amount: friendAmountNumber,
					name: debtName,
					date: dateToDateString(new Date()),
					for_id: forUser.id,
					from_id: fromUser.id,
					is_accepted: forUser.id === me.id ? 'accepted' : 'pending'
				},
				supabase
			);
			onDebtAdded(debt);
		}
		modalAddLoading = false;
		open = false;
	}

	function onFromChange(newFriendId: string) {
		fromUser = friends.find((friend) => friend.id === newFriendId);
	}
	function onForChange(newFriendId: string) {
		forUser = friends.find((friend) => friend.id === newFriendId);
	}
</script>

<FormDialog bind:open on:submit={submitNewDebt}>
	<span slot="header">Neue Schuld</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<div class="flex flex-col gap-3">
			<InputWithLabel label="Name">
				<Input autofocus={true} inputType="text" bind:inputValue={debtName} />
			</InputWithLabel>
			<InputWithLabel label="Betrag">
				<Input inputType="number" bind:inputValue={debtTotalAmount} />
			</InputWithLabel>
			<InputWithLabel label="Ausgabe Von">
				<select
					on:change={(e) => onFromChange(e?.currentTarget?.value)}
					class="select w-full border border-slate-200 p-2 text-base"
				>
					{#each [...friends] as friend}
						<option value={friend.id} selected={friend.id === fromUser?.id}
							>{friend.full_name}</option
						>
					{/each}
				</select>
			</InputWithLabel>
			<InputWithLabel label="Ausgabe Für">
				<select
					on:change={(e) => onForChange(e?.currentTarget?.value)}
					class="select w-full border border-slate-200 p-2 text-base"
				>
					{#each [...friends] as friend}
						<option value={friend.id} selected={friend.id === forUser?.id}
							>{friend.full_name}</option
						>
					{/each}
				</select>
			</InputWithLabel>
		</div>
		<div class="mt-7 flex flex-col gap-2">
			<Button class="py-6" variant="default" type="submit">
				{#if modalAddLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					Speichern
				{/if}
			</Button>
		</div>
	</div>
</FormDialog>
