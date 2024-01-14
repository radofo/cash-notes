<script lang="ts">
	import type { CashGroup, RecCashFlow } from '../../types/supabase';
	import { getCashGroups } from '../../network/cash_group';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import DefaultPageContent from '../../components/DefaultPageContent.svelte';
	import H1 from '../../components/H1.svelte';
	import Button from '../../components/Button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import ModalBudget from '../../components/ModalBudget.svelte';
	import { getRecCashFlows } from '../../network/rec_cash_flow';
	import { initGroups, addRecurringToCashGroups } from '../../utils/recurring';
	import ModalMonthlyEdit from '../../components/ModalMonthlyEdit.svelte';
	import ModalMonthlyCreate from '../../components/ModalMonthlyCreate.svelte';
	import ListTotal from '../../components/ListTotal.svelte';
	import ListSection from '../../components/ListSection.svelte';
	import type { CashGroupWithMeta } from '../../types/recurring';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroups: CashGroup[] = [];
	let recCashFlows: RecCashFlow[] = [];

	let recurringCashGroups: CashGroupWithMeta[] = [];
	let budgetCashGroups: CashGroupWithMeta[] = [];
	let noBudgetCashGroups: CashGroupWithMeta[] = [];
	let incomeCashGroup: CashGroupWithMeta;

	let totalSpendings: number;
	let totalEarnings: number;
	let fixCost: number = 0;
	let budgetedCost: number = 0;
	let savings: number;

	let monthlyCashFlowToEdit: RecCashFlow | undefined;
	let showModal: boolean = false;
	let loading: boolean = false;
	let budgetToEdit: CashGroup | undefined;
	let showInsertModal: boolean = false;
	let showEditModal: boolean = false;

	onMount(async () => {
		loading = true;
		cashGroups = await getCashGroups(supabase);
		recCashFlows = await getRecCashFlows(supabase);
		loading = false;
	});

	$: {
		if (!showModal) {
			budgetToEdit = undefined;
		}
	}

	$: {
		const initializedIncomeCashGroup: CashGroupWithMeta = {
			recurringCashFlows: [],
			total: 0
		};
		const initializedCashGroupsWithMeta = initGroups(cashGroups);

		const {
			newIncomeCashGroup,
			newBudgetCashGroups,
			newNoBudgetCashGroups,
			newRecurringCashGroups
		} = addRecurringToCashGroups(
			initializedIncomeCashGroup,
			initializedCashGroupsWithMeta,
			recCashFlows
		);

		incomeCashGroup = newIncomeCashGroup;
		budgetCashGroups = newBudgetCashGroups;
		noBudgetCashGroups = newNoBudgetCashGroups;
		recurringCashGroups = newRecurringCashGroups;
	}

	$: {
		totalEarnings = incomeCashGroup?.total ?? 0;
		fixCost = recurringCashGroups.reduce((result, recurringCashGroup) => {
			return result + (recurringCashGroup.total ?? 0);
		}, 0);
		budgetedCost = budgetCashGroups.reduce((result, budgetCashGroup) => {
			return result + (budgetCashGroup.total ?? 0);
		}, 0);
		totalSpendings = fixCost + budgetedCost;
		savings = totalEarnings - totalSpendings;
	}

	function openCashGroupEditModal(cashGroup?: CashGroup) {
		if (cashGroup) {
			budgetToEdit = cashGroup;
			showModal = true;
		}
	}

	function updateCashGroups(newCashGroups: CashGroup[]) {
		cashGroups = newCashGroups;
	}
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

	function openRecCashFlowEditModal(toEdit: RecCashFlow) {
		monthlyCashFlowToEdit = toEdit;
		showEditModal = true;
	}
</script>

{#if user}
	<DefaultPageContent>
		<div class="flex w-full flex-col items-center gap-2 px-4 sm:w-[500px]">
			<H1>Mtl. Planung</H1>
			<div class="mt-9 flex w-full flex-col gap-5">
				<div class="flex justify-stretch gap-1">
					<Button fullWidth variant="success" on:btnclick={() => (showModal = true)}
						>+ Kategorie</Button
					>
					<Button fullWidth variant="success" on:btnclick={() => (showInsertModal = true)}
						>+ Fixkosten</Button
					>
				</div>
				{#if loading}
					<div class="mt-10 grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else if !cashGroups.length}
					<div class="mt-8 text-center">Noch keine Kategorie erstellt</div>
				{:else}
					<div class="mt-4 flex flex-col gap-8">
						<ListSection heading="Einnahmen" isIncome cashGroups={[incomeCashGroup]} />
						{#if recurringCashGroups.length}
							<ListSection
								heading="Fixkosten"
								cashGroups={recurringCashGroups}
								{openCashGroupEditModal}
								{openRecCashFlowEditModal}
							/>
						{/if}
						{#if budgetCashGroups.length}
							<ListSection
								heading="Budgets"
								{openCashGroupEditModal}
								{openRecCashFlowEditModal}
								cashGroups={budgetCashGroups}
							/>
						{/if}
						{#if noBudgetCashGroups.length}
							<ListSection
								heading="Ohne Budget"
								{openCashGroupEditModal}
								{openRecCashFlowEditModal}
								cashGroups={noBudgetCashGroups}
							/>
						{/if}
						<ListTotal {budgetedCost} {fixCost} {totalEarnings} {totalSpendings} {savings} />
					</div>
				{/if}
			</div>
		</div>
	</DefaultPageContent>
	<ModalBudget {updateCashGroups} {user} {supabase} bind:showModal {budgetToEdit} {cashGroups} />
	<ModalMonthlyEdit
		{removeRecCashFlow}
		{updateRecCashFlowList}
		{monthlyCashFlowToEdit}
		{user}
		{supabase}
		{cashGroups}
		bind:showModal={showEditModal}
	/>
	<ModalMonthlyCreate
		{insertRecCashFlowList}
		{user}
		{supabase}
		{cashGroups}
		bind:showModal={showInsertModal}
	/>
{/if}
