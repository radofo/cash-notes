<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '../../components/Button.svelte';
	import type { CashGroup, RecCashFlow } from '../../types/supabase';
	import type { PageData } from './$types';
	import { getCashGroups } from '../../network/cash_group';
	import ModalMonthly from '../../components/ModalMonthlyCreate.svelte';
	import DefaultPageContent from '../../components/DefaultPageContent.svelte';
	import H1 from '../../components/H1.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import { getRecCashFlows } from '../../network/rec_cash_flow';
	import List from '../../components/List.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import { getActiveTimeframe } from '../../utils/recurring';
	import ModalMonthlyEdit from '../../components/ModalMonthlyEdit.svelte';

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let showInsertModal = false;
	let showEditModal = false;
	let loading = true;

	let cashGroups: CashGroup[] = [];
	let recCashFlows: RecCashFlow[] = [];
	let monthlyCashFlowToEdit: RecCashFlow | undefined;

	$: {
		if (!showEditModal) {
			monthlyCashFlowToEdit = undefined;
		}
	}

	onMount(async () => {
		loading = true;
		cashGroups = await getCashGroups(supabase);
		recCashFlows = await getRecCashFlows(supabase);
		loading = false;
	});

	function updateRecCashFlowList(updatedRecCashflow: RecCashFlow) {
		recCashFlows = recCashFlows.map((recCf) => {
			if (recCf.id === updatedRecCashflow.id) {
				return updatedRecCashflow;
			}
			return recCf;
		});
	}
	function insertRecCashFlowList(newRecCashflow: RecCashFlow) {
		recCashFlows = [newRecCashflow, ...recCashFlows];
	}
	function removeRecCashFlow(id: string) {
		recCashFlows = recCashFlows.filter((rcf) => rcf.id !== id);
	}

	function openEditModal(toEdit: RecCashFlow) {
		monthlyCashFlowToEdit = toEdit;
		showEditModal = true;
	}
</script>

{#if user?.id}
	<DefaultPageContent>
		<div class="flex w-full flex-col items-center gap-2 px-4 sm:w-[500px]">
			<H1>Monatlich</H1>
			<div class="mt-9 flex w-full flex-col gap-5">
				<Button variant="success" on:btnclick={() => (showInsertModal = true)}
					>Neue mtl. Einnahme/Ausgabe</Button
				>
				{#if loading}
					<div class="mt-10 grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else if !cashGroups.length}
					<div class="mt-8 text-center">Noch keine Kategorie erstellt</div>
				{:else}
					<List>
						{#each recCashFlows as monthlyCashFlow}
							<ListItem on:itemClicked={() => openEditModal(monthlyCashFlow)}>
								<div class="flex flex-col">
									<span>{monthlyCashFlow.name}</span>
									<span class="text-slate-500"
										>{monthlyCashFlow.isIncome
											? 'Einnahme'
											: monthlyCashFlow.cash_group?.name}</span
									>
								</div>
								<div class="flex items-center">
									{getActiveTimeframe(monthlyCashFlow)?.amount ?? '-'}
								</div>
							</ListItem>
						{/each}
					</List>
				{/if}
			</div>
		</div>
		<ModalMonthlyEdit
			{removeRecCashFlow}
			{updateRecCashFlowList}
			{monthlyCashFlowToEdit}
			{user}
			{supabase}
			{cashGroups}
			bind:showModal={showEditModal}
		/>
		<ModalMonthly
			{insertRecCashFlowList}
			{user}
			{supabase}
			{cashGroups}
			bind:showModal={showInsertModal}
		/>
	</DefaultPageContent>
{/if}
