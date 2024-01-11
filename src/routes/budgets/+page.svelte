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
	import { displayCurrency, getActiveTimeframe, getCashGroupTotal } from '../../utils/recurring';
	import { INCOME_ID, type CashGroupMap } from '../../types/recurring';
	import ModalMonthlyEdit from '../../components/ModalMonthlyEdit.svelte';
	import ModalMonthlyCreate from '../../components/ModalMonthlyCreate.svelte';

	export let data: PageData;

	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroups: CashGroup[] = [];
	let recCashFlows: RecCashFlow[] = [];
	let cashGroupMap: CashGroupMap;
	let totalSpendings: number;
	let totalEarnings: number;
	let savings: number;

	let showModal: boolean = false;
	let loading: boolean = false;
	let budgetToEdit: CashGroup | undefined;
	let showInsertModal = false;
	let showEditModal = false;
	let monthlyCashFlowToEdit: RecCashFlow | undefined;

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
		for (const cashGroup of cashGroups) {
			newCashGroupMap.set(cashGroup.id, {
				recurringCashFlows: [],
				cashGroup: { group: cashGroup, total: cashGroup.budget ?? 0 }
			});
		}
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
				newCashGroupMap.set(cash_group.id, {
					recurringCashFlows: [
						...(currentCashGroupDetails?.recurringCashFlows ?? []),
						{ recCashFlow, activeTimeframe }
					],
					cashGroup: {
						group: cash_group,
						total:
							cash_group.budget ??
							(currentCashGroupDetails?.cashGroup.total ?? 0) + (activeTimeframe?.amount ?? 0)
					}
				});
			}
		}
		cashGroupMap = newCashGroupMap;
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
				<Button variant="success" on:btnclick={() => (showModal = true)}>Neue Kategorie</Button>
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
						<ListItem itemType="main">
							<span class="border border-white border-opacity-0">Einnahmen</span>
							<div class="flex items-center">
								<span class="pr-3"
									>{displayCurrency(cashGroupMap.get(INCOME_ID)?.cashGroup.total)}</span
								>
							</div>
						</ListItem>
						{#if (cashGroupMap.get(INCOME_ID)?.recurringCashFlows ?? []).length}
							<div class="mb-2">
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
												<span class="pr-3"
													>{displayCurrency(incomeCashFlow.activeTimeframe?.amount)}</span
												>
											</div>
										</ListItem>
									{/each}
								</List>
							</div>
						{/if}
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
										<span class="pr-3">{displayCurrency(cashGroupDetails.cashGroup.total)}</span>
									</div>
								</ListItem>
								{#if cashGroupDetails.recurringCashFlows.length}
									<div class="mb-2">
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
														<span class="pr-3"
															>{displayCurrency(cashFlow.activeTimeframe?.amount)}</span
														>
													</div>
												</ListItem>
												<!-- {/if} -->
											{/each}
										</List>
									</div>
								{/if}
							{/if}
						{/each}
						<div class="mt-2 flex flex-col gap-1">
							<hr class="border" />
							<hr class="border" />
						</div>
						<div class="mt-3 flex items-center justify-between pl-1 pr-4 font-medium">
							<div>Total Einnahmen</div>
							<span>{displayCurrency(totalEarnings)} </span>
						</div>
						<div class="mt-3 flex flex-col gap-1">
							<hr class="border" />
						</div>
						<div class="mt-3 flex items-center justify-between pl-1 pr-4 font-medium">
							<div>Total Ausgaben</div>
							<span>{displayCurrency(totalSpendings)} </span>
						</div>
						<div class="mt-3 flex flex-col gap-1">
							<hr class="border" />
						</div>
						<div class="mt-3 flex items-center justify-between pl-1 pr-4 font-medium">
							<div>Überschuss</div>
							<span>{displayCurrency(savings)} </span>
						</div>
					</List>
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
