<script lang="ts">
	import { HandCoins, Handshake, Plus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import PageHeaderCore from '../../components/PageHeader/PageHeaderCore.svelte';
	import PageHeaderHeading from '../../components/PageHeader/PageHeaderHeading.svelte';
	import { getCashGroups } from '../../network/cash_group';
	import { getDebtsByUserId, getSettledDebtsGrouped } from '../../network/debt';
	import type { DebtWithProfile } from '../../types/debt';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { displayCurrency } from '../../utils/currency';
	import { debtOverview } from '../../utils/debt.helpers';
	import { debtReloadTrigger, pendingApprovalsCount } from '../../utils/debt.store';
	import type { PageData } from './$types';
	import ApproveModal from './ApproveModal.svelte';
	import DebtAddModal from './DebtAddModal.svelte';
	import DebtChatItem from './DebtChatItem.svelte';
	import SettledDebts from './SettledDebts.svelte';
	import SettlementModal from './SettlementModal.svelte';

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: myself = session?.user.id;
	$: debtStats = debtOverview([...approved, ...unapproved, ...toApprove]);

	// Get other user from settled debts if no unsettled debts exist
	$: firstSettledDebt =
		settledDebtsGrouped.size > 0 ? Array.from(settledDebtsGrouped.values())[0]?.[0] : null;
	$: fallbackOtherPerson = firstSettledDebt
		? firstSettledDebt.from_id === myself
			? firstSettledDebt.for
			: firstSettledDebt.from
		: null;

	// Check if current user is owing (is "for" person)
	$: currentUserOwes = debtStats?.for?.id === myself;
	$: displayAmount = currentUserOwes ? -(debtStats?.total ?? 0) : debtStats?.total ?? 0;
	$: otherPerson = currentUserOwes ? debtStats?.from : debtStats?.for;
	$: finalOtherPerson = otherPerson ?? fallbackOtherPerson;
	$: debtText =
		displayAmount === 0
			? 'alles ausgeglichen'
			: currentUserOwes
			? `du schuldest ${finalOtherPerson?.full_name}`
			: `${finalOtherPerson?.full_name} schuldet dir`;

	let allUnsettled: DebtWithProfile[] = [];
	let settledDebtsGrouped: Map<string, DebtWithProfile[]> = new Map();
	$: toApprove = allUnsettled.filter(
		(debt) => debt.is_accepted === 'pending' && debt.for_id === myself
	);
	$: unapproved = allUnsettled.filter(
		(debt) => debt.is_accepted === 'pending' && debt.for_id !== myself
	);
	$: rejected = allUnsettled.filter(
		(debt) => debt.is_accepted === 'rejected' && debt.from_id === myself
	);
	$: approved = allUnsettled.filter((debt) => debt.is_accepted === 'accepted');

	// Update the pending approvals count in the store
	$: pendingApprovalsCount.set(toApprove.length);

	// Group and sort debts for chat-like display
	$: pendingDebts = [...toApprove, ...rejected, ...unapproved].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);
	$: unsettledDebts = approved.sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	let showApproveModal = false;
	let showSettlementModal = false;
	let showDebtAddModal = false;
	let showDebtEditModal = false;

	onMount(async () => {
		reloadList();
		cashGroupStore.set(await getCashGroups(supabase));
	});

	// Auto-reload when debt store triggers a reload
	$: if ($debtReloadTrigger) {
		reloadList();
	}

	async function reloadList() {
		const userId = session?.user.id;
		if (!userId) {
			return;
		}
		allUnsettled = await getDebtsByUserId(userId, supabase);
		settledDebtsGrouped = await getSettledDebtsGrouped(userId, supabase, 50);
	}

	function debtAdded() {
		reloadList();
	}
	function openSettlementModal() {
		showSettlementModal = true;
	}
	function openApproveModal() {
		showApproveModal = true;
	}
	function updateDebtList(debt: DebtWithProfile) {
		const newDebtList = allUnsettled.map((d) => (d.id === debt.id ? debt : d));
		allUnsettled = newDebtList;
	}
	function onSettlementComplete() {
		showSettlementModal = false;
		reloadList();
	}
</script>

<div class="flex h-full flex-col px-3">
	<ApproveModal {updateDebtList} toApproveDebts={toApprove} bind:open={showApproveModal} />
	<DebtAddModal onDebtAdded={debtAdded} bind:open={showDebtAddModal} />
	<SettlementModal
		{onSettlementComplete}
		toSettleDebts={approved}
		bind:open={showSettlementModal}
	/>
	<PageHeaderCore>
		<PageHeaderHeading slot="text">
			{#if displayAmount !== undefined}
				<div class="flex flex-col items-start">
					{displayCurrency({ amount: displayAmount })}

					<span class="text-sm text-muted-foreground">
						{debtText}
					</span>
				</div>
			{/if}
		</PageHeaderHeading>
	</PageHeaderCore>
	<div class="flex flex-col gap-8 pb-7">
		{#if allUnsettled.length === 0}
			<div class="flex min-h-[calc(100vh-200px)] w-full items-center justify-center py-10">
				<p class="text-sm text-muted-foreground">Keine aktuellen Schulden</p>
			</div>
		{:else}
			<div class="flex min-h-[calc(100vh-200px)] flex-col">
				<!-- Pending debts (toApprove, rejected, unapproved) -->
				{#each pendingDebts as debt}
					{@const isCurrentUser = debt.from_id === myself}
					{@const status =
						debt.is_accepted === 'pending' && debt.for_id === myself
							? 'toApprove'
							: debt.is_accepted === 'rejected'
							? 'rejected'
							: 'unapproved'}
					<DebtChatItem {debt} {isCurrentUser} {status} />
				{/each}

				<!-- Unsettled (approved) debts -->
				{#each unsettledDebts as debt}
					{@const isCurrentUser = debt.from_id === myself}
					<DebtChatItem {debt} {isCurrentUser} status="unsettled" />
				{/each}
			</div>
		{/if}

		<SettledDebts {settledDebtsGrouped} />
	</div>
	<div class="fixed bottom-[92px] left-0 right-0 z-40 flex justify-center">
		<div
			class="flex w-[600px] max-w-full items-center justify-center gap-3 border-b border-t border-border bg-background/95 backdrop-blur-sm"
		>
			<div class="flex w-full items-center justify-around">
				{#if toApprove.length > 0}
					<button
						on:click={openApproveModal}
						class="flex grow cursor-pointer items-center justify-center gap-2 border-r py-4 text-center text-sm font-medium text-foreground hover:text-primary"
					>
						<Handshake size={18} />
						<span>Akzeptieren</span>
					</button>
				{/if}
				{#if approved.length === allUnsettled.length && allUnsettled.length > 0}
					<button
						on:click={openSettlementModal}
						class="flex grow cursor-pointer items-center justify-center gap-2 border-r py-4 text-center text-sm font-medium text-foreground hover:text-primary"
					>
						<HandCoins size={18} />
						<span>Ausgleichen</span>
					</button>
					<div class="h-full w-px self-stretch bg-border" />
				{/if}
				<button
					on:click={() => (showDebtAddModal = true)}
					class="flex grow cursor-pointer items-center justify-center gap-2 py-4 text-center text-sm font-medium text-foreground hover:text-primary"
				>
					<Plus size={18} />
					<span>Neue Schuld</span>
				</button>
			</div>
		</div>
	</div>
</div>
