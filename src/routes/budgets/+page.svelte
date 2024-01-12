<script lang="ts">
	import type { CashGroup, RecCashFlow, RecTimeframe } from '../../types/supabase';
	import { getCashGroups } from '../../network/cash_group';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import DefaultPageContent from '../../components/DefaultPageContent.svelte';
	import H1 from '../../components/H1.svelte';
	import Button from '../../components/Button.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import ModalBudget from '../../components/ModalBudget.svelte';
	import { getRecCashFlows } from '../../network/rec_cash_flow';
	import List from '../../components/List.svelte';
	import ListItem from '../../components/ListItem.svelte';
	import { getActiveTimeframe } from '../../utils/recurring';
	import { INCOME_ID, type CashGroupMap } from '../../types/recurring';
	import ModalMonthlyEdit from '../../components/ModalMonthlyEdit.svelte';
	import ModalMonthlyCreate from '../../components/ModalMonthlyCreate.svelte';
	import { displayCurrency } from '../../utils/currency';
	import ListTotal from '../../components/ListTotal.svelte';
	import ListSection from '../../components/ListSection.svelte';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroups: CashGroup[] = [];
	let recCashFlows: RecCashFlow[] = [];
	let cashGroupMap: CashGroupMap;
	let monthlyCashFlowToEdit: RecCashFlow | undefined;
	let totalSpendings: number;
	let totalEarnings: number;
	let fixCost: number = 0;
	let budgetedCost: number = 0;
	let savings: number;

	let showModal: boolean = false;
	let loading: boolean = false;
	let budgetToEdit: CashGroup | undefined;
	let showInsertModal: boolean = false;
	let showEditModal: boolean = false;

	$: {
		if (!showModal) {
			budgetToEdit = undefined;
		}
	}

	$: {
		totalEarnings = cashGroupMap.get(INCOME_ID)?.cashGroup?.total ?? 0;
		totalSpendings = [...cashGroupMap].reduce((total, [key, details]) => {
			if (key !== INCOME_ID) {
				return total + (details.cashGroup?.total ?? 0);
			}
			return total;
		}, 0);
		savings = totalEarnings - totalSpendings;
	}

	$: {
		const newCashGroupMap: CashGroupMap = new Map();
		let newBudgetedCost = 0;
		for (const cashGroup of cashGroups) {
			newCashGroupMap.set(cashGroup.id, {
				recurringCashFlows: [],
				cashGroup: { group: cashGroup, total: cashGroup.budget ?? 0 }
			});
			newBudgetedCost += cashGroup.budget ?? 0;
		}
		budgetedCost = newBudgetedCost;
		let newFixCost = 0;
		for (const recCashFlow of recCashFlows) {
			const { isIncome, cash_group } = recCashFlow;
			const activeTimeframe = getActiveTimeframe(recCashFlow);
			if (isIncome) {
				const incomeGroupDetails = newCashGroupMap.get(INCOME_ID);
				newCashGroupMap.set(INCOME_ID, {
					recurringCashFlows: [
						...(incomeGroupDetails?.recurringCashFlows ?? []),
						{ recCashFlow, activeTimeframe }
					],
					cashGroup: {
						total: (incomeGroupDetails?.cashGroup.total ?? 0) + (activeTimeframe?.amount ?? 0)
					}
				});
			} else if (cash_group) {
				const currentCashGroupDetails = newCashGroupMap.get(cash_group.id);
				const recurringAmount = activeTimeframe?.amount ?? 0;
				newFixCost += recurringAmount;
				newCashGroupMap.set(cash_group.id, {
					recurringCashFlows: [
						...(currentCashGroupDetails?.recurringCashFlows ?? []),
						{ recCashFlow, activeTimeframe }
					],
					cashGroup: {
						group: cash_group,
						total:
							cash_group.budget ?? (currentCashGroupDetails?.cashGroup.total ?? 0) + recurringAmount
					}
				});
			}
			fixCost = newFixCost;
		}
		cashGroupMap = newCashGroupMap;
		// const filteredCashGroupMap: CashGroupMap = new Map();
		// for (const [key, groupDetails] of newCashGroupMap) {
		// 	if (key === INCOME_ID) {
		// 		filteredCashGroupMap.set(key, groupDetails);
		// 	}
		// 	const hasBudget =
		// 		groupDetails.cashGroup.total !== undefined && groupDetails.cashGroup.total !== 0;
		// 	const hasRecurring = groupDetails.recurringCashFlows.length;
		// 	if (
		// 		(hideNoBudget && !hasBudget) ||
		// 		(expenseFilter === 'withRecurring' && !hasRecurring) ||
		// 		(expenseFilter === 'withoutRecurring' && hasRecurring)
		// 	) {
		// 		continue;
		// 	}
		// 	filteredCashGroupMap.set(key, groupDetails);
		// }
		// cashGroupMap = filteredCashGroupMap;
	}

	onMount(async () => {
		loading = true;
		cashGroups = await getCashGroups(supabase);
		recCashFlows = await getRecCashFlows(supabase);
		loading = false;
	});

	function openModalInEditMode(cashGroup?: CashGroup) {
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

	function openEditModal(toEdit: RecCashFlow) {
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
						>Neue Kategorie</Button
					>
					<Button fullWidth variant="success" on:btnclick={() => (showInsertModal = true)}
						>Neue mtl. Zahlung</Button
					>
				</div>
				{#if loading}
					<div class="mt-10 grid place-items-center">
						<IconLoader class="animate-spin text-center" />
					</div>
				{:else if !cashGroups.length}
					<div class="mt-8 text-center">Noch keine Kategorie erstellt</div>
				{:else}
					<!-- Income List -->
					<div class="mt-4 flex flex-col gap-8">
						<ListSection heading="Einnahmen">
							<ListItem itemType="main">
								<span class="border border-white border-opacity-0">Alle Einnahmen</span>
								<div class="flex items-center">
									<span class=""
										>{displayCurrency({
											amount: cashGroupMap.get(INCOME_ID)?.cashGroup.total
										})}</span
									>
								</div>
							</ListItem>
							{#if (cashGroupMap.get(INCOME_ID)?.recurringCashFlows ?? []).length}
								<div class="">
									<List>
										{#each cashGroupMap.get(INCOME_ID)?.recurringCashFlows ?? [] as incomeCashFlow}
											<ListItem
												itemType="sub"
												on:itemClicked={() => openEditModal(incomeCashFlow.recCashFlow)}
											>
												<span class="border border-white border-opacity-0"
													>{incomeCashFlow.recCashFlow.name}</span
												>
												<div class="flex items-center">
													<span class=""
														>{displayCurrency({
															amount: incomeCashFlow.activeTimeframe?.amount
														})}</span
													>
												</div>
											</ListItem>
										{/each}
									</List>
								</div>
							{/if}
						</ListSection>
						<!-- Expense List -->
						<ListSection heading="Ausgaben">
							{#each cashGroupMap as [cashGroupId, cashGroupDetails]}
								{#if cashGroupId !== INCOME_ID}
									<ListItem
										itemType="main"
										on:itemClicked={(e) => openModalInEditMode(cashGroupDetails.cashGroup.group)}
									>
										<span class="border border-white border-opacity-0"
											>{cashGroupDetails.cashGroup?.group?.name}</span
										>
										<div class="flex items-center">
											<span class=""
												>{displayCurrency({ amount: cashGroupDetails.cashGroup.total })}</span
											>
										</div>
									</ListItem>
									{#if cashGroupDetails.recurringCashFlows.length}
										<div class="">
											<List>
												{#each cashGroupDetails.recurringCashFlows as cashFlow}
													<ListItem
														itemType="sub"
														on:itemClicked={() => openEditModal(cashFlow.recCashFlow)}
													>
														<span class="border border-white border-opacity-0"
															>{cashFlow?.recCashFlow.name}</span
														>
														<div class="flex items-center">
															<span class=""
																>{displayCurrency({
																	amount: cashFlow.activeTimeframe?.amount
																})}</span
															>
														</div>
													</ListItem>
												{/each}
											</List>
										</div>
									{/if}
								{/if}
							{/each}
						</ListSection>
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
