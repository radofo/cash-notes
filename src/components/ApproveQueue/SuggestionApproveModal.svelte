<script lang="ts">
	import { page } from '$app/stores';
	import { insertCashFlow, isInMonth } from '../../network/cash_flow';
	import { deleteSuggestion } from '../../network/cash_flow_suggestion';
	import { insertDebtSupabase } from '../../network/debt';
	import { noFriend } from '../../stores/friends';
	import type { Profile } from '../../types/friendship';
	import { cashFlowStore } from '../../utils/cashFlow.store';
	import { debtReloadTrigger } from '../../utils/debt.store';
	import { suggestionStore } from '../../utils/suggestion.store';
	import DebtSplitFields from '../CashFlow/DebtSplitFields.svelte';
	import ApproveQueueModal from './ApproveQueueModal.svelte';
	import type { ApproveQueueItem, ApproveQueueValues } from './types';

	export let open: boolean;

	$: supabase = $page.data.supabase;
	$: user = $page.data.session?.user;
	$: suggestions = $suggestionStore;

	// Foreign-currency amounts are not pre-filled; the user enters the EUR amount
	$: items = suggestions.map(
		(s): ApproveQueueItem => ({
			id: s.id,
			name: s.name ?? '',
			amount: isForeign(s.currency) ? null : s.amount,
			date: s.date
		})
	);

	// Debt split
	let cfFriend: Profile | undefined = noFriend;
	let cfFriendAmount = '';
	$: if (open) resetFriend();

	function resetFriend() {
		cfFriend = noFriend;
		cfFriendAmount = '';
	}

	function isForeign(currency: string | null): boolean {
		return !!currency && currency !== 'EUR';
	}

	async function approve(item: ApproveQueueItem, values: ApproveQueueValues): Promise<boolean> {
		if (!user?.id) return false;

		const friendAmount = Number.parseFloat(cfFriendAmount === '' ? '0' : cfFriendAmount);
		const ownAmount = values.amount - friendAmount;
		// Never delete the suggestion without saving anything for a non-numeric amount
		if (!Number.isFinite(ownAmount) || ownAmount < 0) return false;

		// Insert Debt
		let debtId: string | undefined = undefined;
		if (friendAmount > 0 && cfFriend?.id && cfFriend.id !== noFriend.id) {
			const debt = await insertDebtSupabase(
				{
					amount: friendAmount,
					name: values.name,
					date: values.date,
					for_id: cfFriend.id,
					from_id: user.id
				},
				supabase
			);
			if (!debt) return false;
			debtId = debt.id;
			debtReloadTrigger.triggerReload();
		}
		// Insert Cash Flow
		if (ownAmount > 0) {
			const newCashFlow = await insertCashFlow(
				{
					amount: ownAmount,
					name: values.name,
					cash_group_id: values.cashGroup.id,
					date: values.date,
					debt_id: debtId,
					owner: user.id
				},
				supabase
			);
			if (!newCashFlow) return false;
			if (isInMonth(newCashFlow, new Date().getMonth(), new Date().getFullYear())) {
				cashFlowStore.insertCashFlow(newCashFlow);
			}
		}

		await deleteSuggestion(item.id, supabase);
		suggestionStore.remove(item.id);
		resetFriend();
		return true;
	}
</script>

<ApproveQueueModal bind:open {items} onApprove={approve} let:item let:totalAmount>
	{@const suggestion = suggestions.find((s) => s.id === item.id)}
	{#if suggestion && isForeign(suggestion.currency) && suggestion.amount !== null}
		<span class="-mt-1 text-xs text-muted-foreground">
			Original: {suggestion.amount.toFixed(2)}
			{suggestion.currency} – bitte Betrag in EUR eingeben
		</span>
	{/if}
	<DebtSplitFields {totalAmount} bind:friend={cfFriend} bind:friendAmount={cfFriendAmount} />
</ApproveQueueModal>
