<script lang="ts">
	import Button from '../components/Button.svelte';
	import DefaultPageContent from '../components/DefaultPageContent.svelte';
	import Input from '../components/Input.svelte';
	import Modal from '../components/Modal.svelte';
	import type { PageData } from './$types';
	import { dateToDateString } from '../utils/date';
	import { onMount } from 'svelte';
	import type { CashFlow, CashGroup, RecCashFlow } from '../types/supabase';
	import { getCashGroups } from '../network/cash_group';
	import { getRecurringTotalForMonth, getIncomeForMonth } from '../utils/recurring';
	import {
		deleteCashFlow,
		getCashFlows,
		insertCashFlow,
		isInMonth,
		updateCashFlow
	} from '../network/cash_flow';
	import InputWithLabel from '../components/InputWithLabel.svelte';
	import CashFlowItem from '../components/CashFlowItem.svelte';
	import ModalMonthSelector from '../components/ModalMonthSelector.svelte';
	import { IconLoader } from '@tabler/icons-svelte';
	import MonthlyBudgets from '../components/MonthlyBudgets.svelte';
	import { getRecCashFlows } from '../network/rec_cash_flow';

	export let data: PageData;
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	let cashGroups: CashGroup[] = [];
	let cashFlows: CashFlow[] = [];
	let recCashFlows: RecCashFlow[] = [];
	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();
	$: cashFlowFilters = cashGroups.map((cg) => cg.name);
	let selectedFilter: string | null = null;

	let showModal: boolean = false;
	let loading: boolean = true;
	let modalLoading: boolean = false;
	let modalDeleteLoading: boolean = false;

	let cfId: string = '';
	let cfName: string = '';
	let cfAmount: string = '';
	let cfGroup: CashGroup | undefined;
	let cfDate: string = dateToDateString(new Date());

	onMount(async () => {
		loading = true;
		cashGroups = await getCashGroups(supabase);
		cashFlows = await getCashFlows(supabase, selectedMonth, selectedYear);
		recCashFlows = await getRecCashFlows(supabase);
		cfGroup = cashGroups?.[0];
		loading = false;
	});

	$: {
		if (!showModal) {
			resetModal();
		}
	}
	$: sortedCashFlows = cashFlows.sort((a: CashFlow, b: CashFlow) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		const createdA = new Date(a.createdAt);
		const createdB = new Date(b.createdAt);
		if (dateA > dateB) {
			return -1;
		} else if (dateB > dateA) {
			return 1;
		} else if (dateB === dateA) {
			return createdA > createdB ? -1 : 1;
		}

		return 0;
	});

	$: filteredCashFlows =
		selectedFilter === null
			? sortedCashFlows
			: sortedCashFlows.filter((cf) => cf.cash_group?.name === selectedFilter);

	function oncfGroupChange(newGroupName: string) {
		cfGroup = cashGroups.find((cashGroup) => cashGroup.name === newGroupName);
	}

	async function deleteCashFlowHandler(id: string) {
		modalDeleteLoading = true;
		const wasDeleteSuccess = await deleteCashFlow(id, supabase);
		if (wasDeleteSuccess) {
			cashFlows = cashFlows.filter((cashFlow) => cashFlow.id !== id);
		}
		modalDeleteLoading = false;
		showModal = false;
	}

	async function editCashFlowHandler(id: string) {
		const cashFlow = cashFlows.find((cf) => cf.id === id);
		if (cashFlow) {
			cfId = cashFlow.id;
			cfName = cashFlow.name;
			cfAmount = cashFlow.amount.toString();
			cfGroup = cashFlow.cash_group;
			cfDate = dateToDateString(new Date(cashFlow.date));
			showModal = true;
		}
	}

	async function submitEditedCashFlow() {
		if (user?.id && cfGroup?.id && cfName && cfAmount && cfId) {
			modalLoading = true;
			const updatedCashFlow = await updateCashFlow(
				{
					id: cfId,
					amount: Number.parseFloat(cfAmount),
					name: cfName,
					cash_group_id: cfGroup.id,
					date: cfDate
				},
				supabase
			);
			if (updatedCashFlow) {
				cashFlows = cashFlows.map((cashFlow) => {
					if (cashFlow.id === updatedCashFlow.id) {
						return updatedCashFlow;
					}
					return cashFlow;
				});
			}
			modalLoading = false;
			showModal = false;
		}
	}

	async function submitNewCashFlow() {
		if (user?.id && cfGroup?.id && cfName && cfAmount) {
			modalLoading = true;
			const newCashFlow = await insertCashFlow(
				{
					amount: parseFloat(cfAmount),
					name: cfName,
					cash_group_id: cfGroup.id,
					date: cfDate,
					owner: user.id
				},
				supabase
			);
			if (newCashFlow && isInMonth(newCashFlow, selectedMonth, selectedYear)) {
				cashFlows = [newCashFlow, ...cashFlows];
			}
			modalLoading = false;
			showModal = false;
		}
	}

	function resetModal() {
		cfId = '';
		cfName = '';
		cfAmount = '';
		cfGroup = cashGroups?.[0];
		cfDate = dateToDateString(new Date());
	}

	async function getNewMonthData(month?: number, year?: number) {
		if (month !== undefined && year !== undefined) {
			cashFlows = await getCashFlows(supabase, month, year);
		}
	}

	const activeFilterStyles = 'bg-slate-600 text-slate-50';
</script>

<DefaultPageContent>
	<div class="flex w-[600px] max-w-full flex-col gap-10 px-4">
		<ModalMonthSelector
			on:monthChanged={(e) => getNewMonthData(e.detail?.selectedMonth, e.detail?.selectedYear)}
		/>
		<MonthlyBudgets
			totalIncome={getIncomeForMonth({ month: selectedMonth, year: selectedYear }, recCashFlows)}
			fixCostTotal={getRecurringTotalForMonth(
				{ month: selectedMonth, year: selectedYear },
				recCashFlows
			)}
			{cashFlows}
			{cashGroups}
		/>
		<div class="flex flex-col items-stretch justify-between gap-10">
			<Button variant="success" on:btnclick={() => (showModal = true)}>Neue Ausgabe</Button>
			{#if loading}
				<div class="mt-8 grid place-items-center">
					<IconLoader class="animate-spin text-center" />
				</div>
			{:else if !sortedCashFlows.length}
				<div class="mt-8 text-center">Noch keine Einträge für diesen Monat</div>
			{:else}
				<div class="text-md flex flex-row items-center justify-start gap-2 overflow-x-auto py-4">
					<button
						on:click={() => (selectedFilter = null)}
						class="whitespace-nowrap rounded-full bg-slate-50 p-3 {!selectedFilter
							? activeFilterStyles
							: ''}">Alle</button
					>
					{#each cashFlowFilters as filter}
						<button
							on:click={() => (selectedFilter = filter)}
							class="whitespace-nowrap rounded-full bg-slate-50 p-3 {selectedFilter === filter
								? activeFilterStyles
								: ''}">{filter}</button
						>
					{/each}
				</div>
				{#if !filteredCashFlows.length}
					<div class="mt-8 text-center">Noch keine Einträge für dieses Budget</div>
				{:else}
					<ul class="w-full list-none">
						{#each filteredCashFlows as cashFlow}
							<CashFlowItem editCashFlow={editCashFlowHandler} {cashFlow} />
						{/each}
					</ul>
				{/if}
			{/if}
		</div>
	</div>
	<Modal bind:showModal>
		<h2 class="mb-3 text-center text-xl font-semibold" slot="header">
			{cfId ? 'Ausgabe Bearbeiten' : 'Neue Ausgabe'}
		</h2>
		<form class="flex flex-col gap-5" on:submit={cfId ? submitEditedCashFlow : submitNewCashFlow}>
			<div class="flex flex-col gap-3">
				<InputWithLabel label="Name">
					<Input inputType="text" bind:inputValue={cfName} />
				</InputWithLabel>
				<InputWithLabel label="Betrag">
					<Input inputType="number" bind:inputValue={cfAmount} />
				</InputWithLabel>
				<InputWithLabel label="Budget">
					<select
						on:change={(e) => oncfGroupChange(e?.currentTarget?.value)}
						class="select w-full border border-slate-200 p-2 text-base"
					>
						{#each cashGroups as cashGroup}
							<option selected={cashGroup.id === cfGroup?.id}>{cashGroup.name}</option>
						{/each}
					</select>
				</InputWithLabel>
				<InputWithLabel label="Datum">
					<Input inputType="date" bind:inputValue={cfDate} />
				</InputWithLabel>
			</div>
			<div class="flex flex-col gap-2">
				<Button variant="success" type="submit">
					{#if modalLoading}
						<div class="grid place-items-center">
							<IconLoader class="animate-spin text-center" />
						</div>
					{:else}
						Speichern
					{/if}
				</Button>
				{#if cfId}
					<Button on:btnclick={() => deleteCashFlowHandler(cfId)} variant="error" type="button">
						{#if modalDeleteLoading}
							<div class="grid place-items-center">
								<IconLoader class="animate-spin text-center" />
							</div>
						{:else}
							Löschen
						{/if}
					</Button>
				{/if}
			</div>
		</form>
	</Modal>
</DefaultPageContent>
