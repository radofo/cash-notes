<script lang="ts">
	import { onMount } from 'svelte';
	import type { CashGroup, RecCashFlow } from '../../types/supabase';
	import { cashGroupStore, recCashFlowStore } from '../../utils/cashGroup.store';
	import { displayCurrency } from '../../utils/currency';
	import {
		getActiveTimeframe,
		getRecurringAmount,
		sortCashFlowsByAmount
	} from '../../utils/recurring';
	import SumItem from './SumItem.svelte';
	import TotalItem from './TotalItem.svelte';
	import TotalSection from './TotalSection.svelte';

	type TotalTableT = {
		incomes: { total: number; open: boolean; recurring: RecCashFlow[] };
		expenses: {
			total: number;
			open: boolean;
			fixedCosts: {
				total: number;
				open: boolean;
				budgets: Map<string, { open: boolean; recCashFlows: RecCashFlow[] }>;
			};
			budgets: { total: number; open: boolean; budgets: Map<string, number> };
		};
	};

	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((group) => group.is_active);
	$: recurring = $recCashFlowStore;
	$: activeRecurring = sortCashFlowsByAmount(
		recurring.filter((rec) => getActiveTimeframe(rec)?.amount !== null)
	);
	let totalTableData: TotalTableT;

	onMount(() => {
		totalTableData = getTotalTableData(activeRecurring, activeCashGroups);
	});

	function getTotalTableData(
		thisMonthsRecurring: RecCashFlow[],
		cashGroups: CashGroup[]
	): TotalTableT {
		// Incomes
		const incomesRecurring = thisMonthsRecurring.filter(
			(rec) => rec.isIncome && getActiveTimeframe(rec) !== undefined
		);
		const incomeTotal = incomesRecurring.reduce((acc, rec) => {
			const activeTimeframe = getActiveTimeframe(rec);
			return acc + (activeTimeframe?.amount ?? 0);
		}, 0);

		// Fixed Cost
		const expensesRecurring = thisMonthsRecurring.filter((rec) => !rec.isIncome);
		const fixedCostMap = new Map<string, { open: boolean; recCashFlows: RecCashFlow[] }>();
		let fixedCostTotal = 0;
		for (const recCashFlow of expensesRecurring) {
			const activeTimeframe = getActiveTimeframe(recCashFlow);
			if (activeTimeframe && recCashFlow.cash_group?.name) {
				const budgetName = recCashFlow.cash_group?.name;
				const budget = fixedCostMap.get(budgetName);
				const budgetCashFlows = budget?.recCashFlows;
				if (budget && budgetCashFlows) {
					budgetCashFlows.push(recCashFlow);
				} else {
					fixedCostMap.set(budgetName, { open: false, recCashFlows: [recCashFlow] });
				}
				fixedCostTotal += activeTimeframe.amount ?? 0;
			}
		}

		// Budget Total
		const budgetedGroups = cashGroups.filter((group) => group.budget);
		const budgetsMap = new Map<string, number>();
		let budgetsTotal = 0;
		for (const group of budgetedGroups) {
			const budgetAmount = group.budget ?? 0;
			budgetsMap.set(group.name, budgetAmount);
			budgetsTotal += budgetAmount;
		}

		return {
			incomes: { total: incomeTotal, open: true, recurring: incomesRecurring },
			expenses: {
				open: true,
				total: fixedCostTotal + budgetsTotal,
				fixedCosts: { total: fixedCostTotal, open: false, budgets: fixedCostMap },
				budgets: { total: budgetsTotal, open: false, budgets: budgetsMap }
			}
		};
	}
</script>

{#if !totalTableData}
	<p>Loading...</p>
{:else}
	<div>
		<TotalSection bind:open={totalTableData.incomes.open}>
			<div slot="title">Einnahmen</div>
			<span slot="total">
				{displayCurrency({ amount: totalTableData.incomes.total, sign: '+' })}</span
			>
			<div slot="content">
				{#each totalTableData.incomes.recurring as rec}
					<TotalItem>
						<span>{rec.name}</span>
						<span>{displayCurrency({ amount: getRecurringAmount(rec), sign: '+' })}</span>
					</TotalItem>
				{/each}
			</div>
		</TotalSection>
		<TotalSection bind:open={totalTableData.expenses.open}>
			<div slot="title">Ausgaben</div>
			<span slot="total"> {displayCurrency({ amount: totalTableData.expenses.total })} </span>
			<div slot="content">
				<TotalSection bind:open={totalTableData.expenses.fixedCosts.open}>
					<div slot="title">Fixkosten</div>
					<span slot="total">
						{displayCurrency({ amount: totalTableData.expenses.fixedCosts.total })}
					</span>
					<div slot="content">
						{#each Array.from(totalTableData.expenses.fixedCosts.budgets) as [name, { recCashFlows, open }]}
							<TotalSection bind:open>
								<div slot="title">{name}</div>
								<span slot="total">
									{displayCurrency({
										amount: recCashFlows.reduce((acc, rec) => {
											return acc + getRecurringAmount(rec);
										}, 0)
									})}
								</span>
								<div slot="content">
									{#each recCashFlows as rec}
										<TotalItem>
											<span>{rec.name}</span>
											<span>{displayCurrency({ amount: getRecurringAmount(rec) })}</span>
										</TotalItem>
									{/each}
								</div>
							</TotalSection>
						{/each}
					</div>
				</TotalSection>
				<TotalSection bind:open={totalTableData.expenses.budgets.open}>
					<div slot="title">Budgets</div>
					<span slot="total"
						>{displayCurrency({ amount: totalTableData.expenses.budgets.total })}</span
					>
					<div slot="content">
						{#each Array.from(totalTableData.expenses.budgets.budgets) as [name, amount]}
							<TotalItem>
								<span>{name}</span>
								<span>{displayCurrency({ amount })}</span>
							</TotalItem>
						{/each}
					</div>
				</TotalSection>
			</div>
		</TotalSection>
		<SumItem>
			<span
				>{totalTableData.incomes.total - totalTableData.expenses.total < 0
					? 'Verlust'
					: 'Überschuss'}</span
			>
			<span
				>{displayCurrency({
					amount: totalTableData.incomes.total - totalTableData.expenses.total
				})}</span
			>
		</SumItem>
	</div>
{/if}
