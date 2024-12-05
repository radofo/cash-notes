<script lang="ts">
	import { type CarouselAPI } from '$lib/components/ui/carousel/context.js';

	import * as Carousel from '$lib/components/ui/carousel';
	import { IconLoader } from '@tabler/icons-svelte';
	import { ChevronLeft, RefreshCcw, WalletCards } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import BudgetModalAdd from '../../../components/Monthly/Budget/BudgetModalAdd.svelte';
	import BudgetModalEdit from '../../../components/Monthly/Budget/BudgetModalEdit.svelte';
	import BudgetView from '../../../components/Monthly/Budget/BudgetView.svelte';
	import CarouselFullSlide from '../../../components/Monthly/CarouselFullSlide.svelte';
	import RecurringModalAdd from '../../../components/Monthly/Recurring/RecurringModalAdd.svelte';
	import RecurringModalEdit from '../../../components/Monthly/Recurring/RecurringModalEdit.svelte';
	import RecurringView from '../../../components/Monthly/Recurring/RecurringView.svelte';
	import * as BudgetTabs from '../../../components/Monthly/Tabs';
	import { getCashGroups } from '../../../network/cash_group';
	import { getRecCashFlows } from '../../../network/rec_cash_flow';
	import type { CashGroup, RecCashFlow } from '../../../types/supabase';
	import { cashGroupStore, recCashFlowStore } from '../../../utils/cashGroup.store';
	import type { PageData } from './$types';

	// Props
	export let data: PageData;

	// Page
	let pageLoading: boolean = true;
	onMount(async () => {
		pageLoading = true;
		if (!$cashGroupStore.length) {
			cashGroupStore.set(await getCashGroups(supabase));
		}
		if (!$recCashFlowStore.length) {
			recCashFlowStore.set(await getRecCashFlows(supabase));
		}
		pageLoading = false;
	});

	// Supabase
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	// Tab Management
	type TabType = 'budget' | 'recurring';
	const tabs: TabType[] = ['budget', 'recurring'];
	let api: CarouselAPI;
	let currentTab: TabType = 'budget';
	$: if (api) {
		currentTab = tabs[api.selectedScrollSnap()];
		api.on('select', () => {
			currentTab = tabs[api.selectedScrollSnap()];
		});
	}
	function selectTab(name: TabType) {
		api.scrollTo(tabs.findIndex((tab) => tab === name));
	}

	// Budget Edit Modal
	let showEditBudgetModal: boolean = false;
	let budgetToEdit: CashGroup | undefined;
	$: {
		if (!showEditBudgetModal) {
			budgetToEdit = undefined;
		}
	}
	function openCashGroupEditModal(cashGroup?: CashGroup) {
		if (cashGroup) {
			budgetToEdit = cashGroup;
			showEditBudgetModal = true;
		}
	}

	// Recurring Edit Modal
	let showEditRecurringModal: boolean = false;
	let recurringToEdit: RecCashFlow | undefined;
	$: {
		if (!showEditRecurringModal) {
			recurringToEdit = undefined;
		}
	}
	function openEditRecurringModal(recurringCf?: RecCashFlow) {
		if (recurringCf) {
			recurringToEdit = recurringCf;
			showEditRecurringModal = true;
		}
	}

	// Budget Modal Add
	let budgetModalOpen: boolean = false;
	function onBudgetAddOpen() {
		budgetModalOpen = true;
	}
	// Recurring Modal Add
	let recurringModalOpen: boolean = false;
	function onRecurringAddOpen() {
		recurringModalOpen = true;
	}
</script>

{#if user}
	{#if pageLoading}
		<div class="mt-10 grid place-items-center">
			<IconLoader class="animate-spin text-center" />
		</div>
	{:else}
		<div class="flex h-full flex-col items-start gap-8 px-3">
			<BudgetModalAdd bind:open={budgetModalOpen} />
			<RecurringModalAdd bind:open={recurringModalOpen} />
			<BudgetModalEdit {budgetToEdit} bind:open={showEditBudgetModal} />
			<RecurringModalEdit {recurringToEdit} bind:open={showEditRecurringModal} />
			<a href="/budgets" class="flex flex-row items-center">
				<ChevronLeft size={24} />
				<p>Übersicht</p>
			</a>
			<div class="flex w-full flex-col items-center gap-8">
				<BudgetTabs.Core>
					<BudgetTabs.Item onClick={() => selectTab('budget')} selected={currentTab === 'budget'}>
						<WalletCards size={20} />
					</BudgetTabs.Item>
					<BudgetTabs.Item
						selected={currentTab === 'recurring'}
						onClick={() => selectTab('recurring')}
					>
						<RefreshCcw size={20} />
					</BudgetTabs.Item>
				</BudgetTabs.Core>
				<Carousel.Root class="w-full flex-1" bind:api>
					<Carousel.Content class="h-full">
						<CarouselFullSlide>
							<BudgetView {onBudgetAddOpen} {openCashGroupEditModal} />
						</CarouselFullSlide>
						<CarouselFullSlide>
							<RecurringView {onRecurringAddOpen} {openEditRecurringModal} />
						</CarouselFullSlide>
					</Carousel.Content>
				</Carousel.Root>
			</div>
		</div>
	{/if}
{/if}
