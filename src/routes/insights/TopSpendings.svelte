<script lang="ts">
	import { page } from '$app/stores';
	import CashFlowModalEdit from '../../components/CashFlow/CashFlowModalEdit.svelte';
	import CashFlowItem from '../../components/CashFlowItem.svelte';
	import { getTopCashFlows } from '../../network/cash_flow';
	import type { CashFlow } from '../../types/supabase';
	import InsightSection from './InsightSection.svelte';

	export let cashGroups: string[] = [];
	export let months: string[] = [];

	let topCashFlows: CashFlow[] = [];
	let cashFlowToEdit: CashFlow | undefined = undefined;
	let showEditModal: boolean = false;

	$: supabase = $page.data.supabase;
	$: sortedMonths = months.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
	$: startMonth = sortedMonths[sortedMonths.length - 1];
	$: endMonth = sortedMonths[0];
	$: {
		if (!showEditModal) {
			cashFlowToEdit = undefined;
		}
	}
	$: {
		(async () => {
			if (startMonth && endMonth) {
				topCashFlows = await getTopCashFlows({
					supabase,
					limit: 20,
					endMonth,
					startMonth,
					cashGroups
				});
			}
		})();
	}

	function openCashFlowModal(cashFlow: CashFlow) {
		cashFlowToEdit = cashFlow;
		showEditModal = true;
	}
</script>

<InsightSection title="Top Ausgaben">
	<CashFlowModalEdit {cashFlowToEdit} bind:open={showEditModal} />
	{#if topCashFlows.length > 0}
		<ul class="w-full list-none">
			{#each topCashFlows as cashFlow}
				<CashFlowItem showMonth editCashFlow={openCashFlowModal} {cashFlow} />
			{/each}
		</ul>
	{:else}
		<p>No spendings found.</p>
	{/if}
</InsightSection>
