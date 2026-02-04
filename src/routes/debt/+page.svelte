<script lang="ts">
	import { HandCoins, Handshake, RotateCw, TicketPlus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import PageHeaderCore from '../../components/PageHeader/PageHeaderCore.svelte';
	import PageHeaderHeading from '../../components/PageHeader/PageHeaderHeading.svelte';
	import { getCashGroups } from '../../network/cash_group';
	import { getDebtsByUserId, getSettledDebtsGrouped } from '../../network/debt';
	import type { DebtWithProfile } from '../../types/debt';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import type { PageData } from './$types';
	import ApproveModal from './ApproveModal.svelte';
	import DebtActionButton from './DebtActionButton.svelte';
	import DebtAddModal from './DebtAddModal.svelte';
	import DebtStats from './DebtStats.svelte';
	import ProposalDebts from './ProposalDebts.svelte';
	import RejectedDebts from './RejectedDebts.svelte';
	import SettledDebts from './SettledDebts.svelte';
	import SettlementModal from './SettlementModal.svelte';
	import ToApproveDebts from './ToApproveDebts.svelte';
	import UnsettledDebts from './UnsettledDebts.svelte';

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: myself = session?.user.id;

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

	let showApproveModal = false;
	let showSettlementModal = false;
	let showDebtAddModal = false;
	let showDebtEditModal = false;
	let isReloading = false;

	let iconSize = 22;

	onMount(async () => {
		reloadList();
		cashGroupStore.set(await getCashGroups(supabase));
	});

	async function reloadList() {
		isReloading = true;
		const userId = session?.user.id;
		if (!userId) {
			return;
		}
		allUnsettled = await getDebtsByUserId(userId, supabase);
		settledDebtsGrouped = await getSettledDebtsGrouped(userId, supabase, 50);
		isReloading = false;
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
		<PageHeaderHeading slot="text">Schulden</PageHeaderHeading>
	</PageHeaderCore>
	<div class="flex flex-col gap-8 pb-7">
		<DebtStats debts={[...approved, ...unapproved, ...toApprove]} />
		{#if allUnsettled.length === 0}
			<div class="flex h-[70vh] w-full items-center justify-center">
				<p class="text-muted-foreground">Keine Schulden vorhanden</p>
			</div>
		{:else}
			{#if toApprove.length > 0}
				<ToApproveDebts toApproveDebts={toApprove} />
			{/if}
			{#if rejected.length > 0}
				<RejectedDebts rejectedDebts={rejected} />
			{/if}
			{#if unapproved.length > 0}
				<ProposalDebts openDebts={unapproved} />
			{/if}
			<UnsettledDebts unsettledDebts={approved} />
			<SettledDebts {settledDebtsGrouped} />
		{/if}
	</div>
	<div
		class="fixed bottom-[100px] left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-muted px-2 text-foreground"
	>
		<DebtActionButton text="Reagieren" clickHandler={reloadList}>
			<RotateCw size={iconSize} class={isReloading ? 'animate-spin' : ''} />
		</DebtActionButton>
		{#if toApprove.length > 0}
			<DebtActionButton text="Reagieren" clickHandler={openApproveModal}>
				<Handshake size={iconSize} />
			</DebtActionButton>
		{/if}
		{#if approved.length === allUnsettled.length && allUnsettled.length > 0}
			<DebtActionButton text="Begleichen" clickHandler={openSettlementModal}>
				<HandCoins size={iconSize} />
			</DebtActionButton>
		{/if}
		<DebtActionButton text="Neue Schuld" clickHandler={() => (showDebtAddModal = true)}>
			<TicketPlus size={iconSize} />
		</DebtActionButton>
	</div>
</div>
