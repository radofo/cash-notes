<script lang="ts">
	import { type CarouselAPI } from '$lib/components/ui/carousel/context.js';

	import * as Carousel from '$lib/components/ui/carousel';
	import { IconLoader, IconMoneybag } from '@tabler/icons-svelte';
	import { List, RefreshCcw } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import BudgetModalEdit from '../../components/Monthly/Budget/BudgetModalEdit.svelte';
	import BudgetView from '../../components/Monthly/Budget/BudgetView.svelte';
	import CarouselFullSlide from '../../components/Monthly/CarouselFullSlide.svelte';
	import RecurringModalEdit from '../../components/Monthly/Recurring/RecurringModalEdit.svelte';
	import RecurringView from '../../components/Monthly/Recurring/RecurringView.svelte';
	import * as BudgetTabs from '../../components/Monthly/Tabs';
	import { getCashGroups } from '../../network/cash_group';
	import { getRecCashFlows } from '../../network/rec_cash_flow';
	import type { CashGroup, RecCashFlow } from '../../types/supabase';
	import { cashGroupStore, recCashFlowStore } from '../../utils/cashGroup.store';
	import type { PageData } from './$types';

	// Props
	export let data: PageData;

	// Page
	let pageLoading: boolean = true;
	onMount(async () => {
		pageLoading = true;
		cashGroupStore.set(await getCashGroups(supabase));
		recCashFlowStore.set(await getRecCashFlows(supabase));
		pageLoading = false;
	});

	// Supabase
	let { supabase, session } = data;
	$: ({ supabase, session } = data);
	$: user = session?.user;

	// Tab Management
	type TabType = 'budget' | 'recurring' | 'total';
	const tabs: TabType[] = ['budget', 'recurring', 'total'];
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
</script>

{#if user}
	{#if pageLoading}
		<div class="mt-10 grid place-items-center">
			<IconLoader class="animate-spin text-center" />
		</div>
	{:else}
		<div class="flex h-full flex-col items-center gap-8 px-3">
			<BudgetModalEdit {budgetToEdit} bind:open={showEditBudgetModal} />
			<RecurringModalEdit {recurringToEdit} bind:open={showEditRecurringModal} />
			<BudgetTabs.Core>
				<BudgetTabs.Item onClick={() => selectTab('budget')} selected={currentTab === 'budget'}>
					<IconMoneybag size={20} />
				</BudgetTabs.Item>
				<BudgetTabs.Item
					selected={currentTab === 'recurring'}
					onClick={() => selectTab('recurring')}
				>
					<RefreshCcw size={20} />
				</BudgetTabs.Item>
				<BudgetTabs.Item selected={currentTab === 'total'} onClick={() => selectTab('total')}>
					<List size={20} />
				</BudgetTabs.Item>
			</BudgetTabs.Core>
			<Carousel.Root class="w-full flex-1" bind:api>
				<Carousel.Content class="h-full">
					<CarouselFullSlide>
						<BudgetView {openCashGroupEditModal} />
					</CarouselFullSlide>
					<CarouselFullSlide>
						<RecurringView {openEditRecurringModal} />
					</CarouselFullSlide>
					<CarouselFullSlide>
						<!-- <TotalView {budgetedCost} {totalSpendings} {totalEarnings} {fixCost} {savings} /> -->
					</CarouselFullSlide>
				</Carousel.Content>
			</Carousel.Root>
		</div>
	{/if}
{/if}
