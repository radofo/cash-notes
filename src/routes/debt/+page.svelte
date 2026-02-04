<script lang="ts">
	import { HandCoins, Handshake, Plus } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import PageHeaderCore from '../../components/PageHeader/PageHeaderCore.svelte';
	import PageHeaderHeading from '../../components/PageHeader/PageHeaderHeading.svelte';
	import { getCashGroups } from '../../network/cash_group';
	import { getDebtsByUserId, getSettledDebtsGrouped } from '../../network/debt';
	import type { DebtWithProfile } from '../../types/debt';
	import { cashGroupStore } from '../../utils/cashGroup.store';
	import { debtReloadTrigger } from '../../utils/debt.store';
	import type { PageData } from './$types';
	import ApproveModal from './ApproveModal.svelte';
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

	onMount(async () => {
		reloadList();
		cashGroupStore.set(await getCashGroups(supabase));
	});

	// Auto-reload when debt store triggers a reload
	$: if ($debtReloadTrigger) {
		reloadList();
	}

	async function reloadList() {
		console.log('Reloading debt list...');
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
			{#if approved.length > 0}
				<UnsettledDebts unsettledDebts={approved} />
			{/if}
			<SettledDebts {settledDebtsGrouped} />
		{/if}
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
						<span>Begleichen</span>
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
