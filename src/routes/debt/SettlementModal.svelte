<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import FormDialog from '../../components/FormDialog/FormDialog.svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import DebtListItem from './DebtListItem.svelte';
	import { displayCurrency } from '../../utils/currency';
	import { settleDebt } from '../../network/debt';
	import { page } from '$app/stores';
	import { debtOverview } from '../../utils/debt.helpers';
	import DebtStats from './DebtStats.svelte';

	export let toSettleDebts: DebtWithProfile[];
	export let open: boolean;
	export let onSettlementComplete: () => void;

	let settlementLoading: boolean = false;

	$: supabase = $page.data.supabase;
	$: settlementStats = debtOverview(toSettleDebts);

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
			<DebtStats debts={toSettleDebts} />
			<ul class="w-full list-none">
				{#each toSettleDebts as debt}
					<DebtListItem {debt} />
				{/each}
			</ul>
		</div>
		<div class="flex flex-col gap-2">
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
					{displayCurrency({ amount: settlementStats?.total ?? 0 })} begleichen
				{/if}
			</Button>
		</div>
	</div>
</FormDialog>
