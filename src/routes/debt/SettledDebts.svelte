<script lang="ts">
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '$lib/components/ui/collapsible';
	import { ChevronDown } from 'lucide-svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import DebtListItem from './DebtListItem.svelte';

	export let settledDebtsGrouped: Map<string, DebtWithProfile[]>;

	function getLatestDate(debts: DebtWithProfile[]): string {
		if (debts.length === 0) return '';
		// Find the debt with the newest createdAt (when it was added to the database)
		const latest = debts.reduce((latest, current) => {
			return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
		}, debts[0]);

		// Format the date field (not createdAt) as DD.MM.YYYY
		const date = new Date(latest.date);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}.${month}.${year}`;
	}

	// Convert Map to Array for iteration
	$: groupedArray = Array.from(settledDebtsGrouped.entries());
</script>

{#if groupedArray.length > 0}
	<div class="flex flex-col gap-2">
		<h2 class="font-medium text-muted-foreground">Beglichene Schulden</h2>

		<div class="flex flex-col gap-2">
			{#each groupedArray as [settlementId, debts]}
				<Collapsible class="w-full">
					<CollapsibleTrigger
						class="flex w-full items-center justify-between rounded-lg border bg-card p-3 text-left hover:bg-accent"
					>
						<span class="font-medium">{getLatestDate(debts)}</span>
						<ChevronDown
							size={20}
							class="transition-transform duration-200 [[data-state=open]_&]:rotate-180"
						/>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<div class="mt-2 rounded-lg border bg-card p-2">
							<ul class="w-full list-none">
								{#each debts as debt}
									<DebtListItem {debt} />
								{/each}
							</ul>
						</div>
					</CollapsibleContent>
				</Collapsible>
			{/each}
		</div>
	</div>
{/if}
