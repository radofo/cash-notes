<script lang="ts">
	import type { CashGroupWithMeta } from '../types/recurring';
	import type { CashGroup, RecCashFlow } from '../types/supabase';
	import { displayCurrency } from '../utils/currency';
	import List from './List.svelte';
	import ListItem from './ListItem.svelte';
	import Obfuscate from './Obfuscate.svelte';

	export let heading: string | undefined = undefined;
	export let cashGroups: CashGroupWithMeta[];
	export let isIncome: boolean = false;

	export let openCashGroupEditModal: ((cashGroup?: CashGroup) => void) | undefined = undefined;
	export let openRecCashFlowEditModal: ((recCashFlow: RecCashFlow) => void) | undefined = undefined;
</script>

<div class="flex flex-col gap-2">
	{#if heading}
		<span class="block text-center text-lg font-semibold">{heading}</span>
	{/if}
	<List>
		{#each cashGroups as cashGroup}
			<ListItem
				itemType="main"
				on:itemClicked={(e) => openCashGroupEditModal?.(cashGroup.cashGroup)}
			>
				<span class="border border-white border-opacity-0"
					>{isIncome ? 'Alle Einnahmen' : cashGroup.cashGroup?.name}</span
				>
				<div class="relative flex items-center">
					<Obfuscate exception={!isIncome}>
						<span class="">{displayCurrency({ amount: cashGroup.total })}</span>
					</Obfuscate>
				</div>
			</ListItem>
			{#if cashGroup.recurringCashFlows.length}
				<div class="">
					<List>
						{#each cashGroup.recurringCashFlows as cashFlow}
							<ListItem
								itemType="sub"
								on:itemClicked={() => openRecCashFlowEditModal?.(cashFlow.recCashFlow)}
							>
								<span class="border border-white border-opacity-0"
									>{cashFlow?.recCashFlow.name}</span
								>
								<div class="relative flex items-center">
									<Obfuscate exception={!isIncome}>
										<span class=""
											>{displayCurrency({
												amount: cashFlow.activeTimeframe?.amount
											})}</span
										>
									</Obfuscate>
								</div>
							</ListItem>
						{/each}
					</List>
				</div>
			{/if}
		{/each}
	</List>
</div>
