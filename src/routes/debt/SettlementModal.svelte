<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import FormDialog from '../../components/FormDialog/FormDialog.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import DebtListItem from './DebtListItem.svelte';
	import { displayCurrency } from '../../utils/currency';
	import { settleDebt } from '../../network/debt';
	import { page } from '$app/stores';

	export let toSettleDebts: DebtWithProfile[];
	export let open: boolean;
	export let onSettlementComplete: () => void;

	let settlementLoading: boolean = false;

	$: personA = toSettleDebts[0]?.from;
	$: personB = toSettleDebts[0]?.for;
	$: totalSettlement = // is the amount that personA gets from personB
		personA && personB
			? toSettleDebts.reduce((sum, debt) => {
					if (debt.from_id === personA.id) {
						return sum + debt.amount;
					} else {
						return sum - debt.amount;
					}
			  }, 0)
			: 0;
	$: settlementAmount = Math.abs(totalSettlement);
	$: supabase = $page.data.supabase;

	async function settleDebts() {
		settlementLoading = true;
		const result = await settleDebt(toSettleDebts, supabase);
		if (result) {
			onSettlementComplete();
		}
		settlementLoading = false;
	}
</script>

<FormDialog bind:open on:submit={settleDebts}>
	<span slot="header">Ausgleichszahlung</span>
	<div slot="content" class="flex h-full flex-col justify-between">
		<div class="flex flex-col gap-7">
			<h2 class="flex flex-col">
				<span class="text-slate-600">
					{#if totalSettlement > 0}
						{personB?.full_name} {'schuldet'} {personA?.full_name}
					{:else}
						{personA?.full_name} {'schuldet'} {personB?.full_name}
					{/if}
				</span>
				<span class="text-xl font-bold">{displayCurrency({ amount: settlementAmount })}</span>
			</h2>
			<ul class="w-full list-none">
				{#each toSettleDebts as debt}
					<DebtListItem {debt} />
				{/each}
			</ul>
		</div>
		<div class="mt-7 flex flex-col gap-2">
			<Button
				class="bg-green-100 py-6 text-green-800 hover:bg-green-200"
				variant="default"
				type="submit"
			>
				{#if settlementLoading}
					<div class="grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else}
					{displayCurrency({ amount: settlementAmount })} begleichen
				{/if}
			</Button>
		</div>
	</div>
</FormDialog>
