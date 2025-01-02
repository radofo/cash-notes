<script lang="ts">
	import { IconLoader } from '@tabler/icons-svelte';
	import { Pen } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import PageHeaderCore from '../../components/PageHeader/PageHeaderCore.svelte';
	import PageHeaderHeading from '../../components/PageHeader/PageHeaderHeading.svelte';
	import TotalTable from '../../components/Total/TotalTable.svelte';
	import { getCashGroups } from '../../network/cash_group';
	import { getRecCashFlows } from '../../network/rec_cash_flow';
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
</script>

{#if user}
	{#if pageLoading}
		<div class="mt-10 grid place-items-center">
			<IconLoader class="animate-spin text-center" />
		</div>
	{:else}
		<div class="flex h-full flex-col px-3">
			<PageHeaderCore>
				<PageHeaderHeading slot="text">Monatlich</PageHeaderHeading>
				<a slot="actions" href="/budgets/edit">
					<Pen class="cursor-pointer" size={18} />
				</a>
			</PageHeaderCore>
			<TotalTable />
		</div>
	{/if}
{/if}
