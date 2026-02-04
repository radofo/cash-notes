<script lang="ts">
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger
	} from '$lib/components/ui/collapsible';
	import { ChevronDown } from 'lucide-svelte';
	import type { DebtWithProfile } from '../../types/debt';
	import { formatCurrency } from '../../utils/currency';
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

	function calculateNetAmounts(
		debts: DebtWithProfile[]
	): Map<string, { name: string; amount: number }> {
		const netAmounts = new Map<string, { name: string; amount: number }>();

		debts.forEach((debt) => {
			// from_id spent money (is owed) - add positive amount
			if (debt.from_id) {
				const current = netAmounts.get(debt.from_id) || {
					name: debt.from?.full_name || '?',
					amount: 0
				};
				netAmounts.set(debt.from_id, { ...current, amount: current.amount + debt.amount });
			}
			// for_id had money spent for them (owes) - add negative amount
			if (debt.for_id) {
				const current = netAmounts.get(debt.for_id) || {
					name: debt.for?.full_name || '?',
					amount: 0
				};
				netAmounts.set(debt.for_id, { ...current, amount: current.amount - debt.amount });
			}
		});

		return netAmounts;
	}

	function getTotalAmount(debts: DebtWithProfile[]): number {
		if (debts.length === 0) return 0;
		const netAmounts = calculateNetAmounts(debts);
		// Return the absolute value of the net settlement (what one person pays to the other)
		const netArray = Array.from(netAmounts.values());
		const receiver = netArray.find((p) => p.amount > 0);
		return receiver ? Math.abs(receiver.amount) : 0;
	}

	function getSettlementSummary(debts: DebtWithProfile[]): string {
		if (debts.length === 0) return '';
		const netAmounts = calculateNetAmounts(debts);

		// Find who pays (negative) and who receives (positive)
		const netArray = Array.from(netAmounts.values());
		const payer = netArray.find((p) => p.amount < 0);
		const receiver = netArray.find((p) => p.amount > 0);

		if (payer && receiver) {
			return `${payer.name} → ${receiver.name}`;
		}
		return `${debts.length} ${debts.length === 1 ? 'Schuld' : 'Schulden'}`;
	}

	// Convert Map to Array for iteration
	$: groupedArray = Array.from(settledDebtsGrouped.entries());
</script>

{#if groupedArray.length > 0}
	<div class="flex flex-col gap-2">
		<h2 class="text-sm font-medium text-muted-foreground">Bereits Beglichen</h2>

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
								<!-- Settlement summary item -->
								<li class="flex items-center justify-between border-b py-2">
									<div class="flex items-center gap-1">
										<div class="flex flex-col">
											<span class="text-md font-medium"> Ausgleich </span>
											<span class="text-sm text-muted-foreground">
												{getSettlementSummary(debts)}
											</span>
										</div>
									</div>
									<div class="flex flex-col items-end">
										<span class="text-md font-medium">
											{formatCurrency(getTotalAmount(debts))} €
										</span>
									</div>
								</li>
								<!-- Individual debts -->
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
