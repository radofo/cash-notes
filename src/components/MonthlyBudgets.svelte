<script lang="ts">
	import { onMount } from 'svelte';
	import type { BudgetProgress, BudgetProgressMap } from '../types/budget';
	import type { Month } from '../types/date';
	import type { TableOpenState } from '../types/recurring';
	import type { CashFlow, CashGroup, RecCashFlow } from '../types/supabase';
	import { displayCurrency } from '../utils/currency';
	import { getRealTotalData } from '../utils/recurring';
	import ProgressElement from './ProgressElement.svelte';
	import SumItem from './Total/SumItem.svelte';
	import TotalItem from './Total/TotalItem.svelte';
	import TotalSection from './Total/TotalSection.svelte';

	export let recurring: RecCashFlow[];
	export let cashFlows: CashFlow[];
	export let month: Month;

	export let cashGroups: CashGroup[];
	export let totalFixCost: number;
	export let totalIncome: number;

	let progressWithBudget: Map<string, BudgetProgress>;
	let progressNoBudget: Map<string, BudgetProgress>;
	let budgetProgress: BudgetProgress;
	let noBudgetSpendings: number;

	let tableOpenStates: TableOpenState;
	$: totalTableData = getRealTotalData(cashFlows, recurring, month);

	onMount(() => {
		const fixedCostsBudgets: { [key: string]: boolean } = {};
		for (const [key, _] of totalTableData.expenses.fixedCosts.fixedBudgets) {
			fixedCostsBudgets[key] = false;
		}
		tableOpenStates = {
			incomes: false,
			expenses: false,
			fixedCosts: false,
			budgets: false,
			noBudgets: false,
			fixedCostsBudgets
		};
	});

	$: totalSpent = budgetProgress.spent + noBudgetSpendings + totalFixCost;
	$: total = totalIncome - totalSpent;

	$: {
		const newProgressNoBudget = new Map<string, BudgetProgress>();
		const newProgressWithBudget = new Map<string, BudgetProgress>();
		let totalSpent = 0;
		let newNoBudgetSpendings = 0;
		for (const cashFlow of cashFlows) {
			const cashGroup = cashFlow.cash_group;
			if (!cashGroup) continue;

			if (cashGroup.name) {
				if (cashGroup.budget) {
					const newSpent =
						(newProgressWithBudget.get(cashGroup.name ?? '')?.spent ?? 0) + cashFlow.amount;
					newProgressWithBudget.set(cashGroup.name, {
						limit: cashGroup.budget,
						spent: newSpent
					});
					totalSpent += cashFlow.amount;
				} else {
					const newSpent =
						(newProgressNoBudget.get(cashGroup.name ?? '')?.spent ?? 0) + cashFlow.amount;
					newProgressNoBudget.set(cashGroup.name, {
						limit: null,
						spent: newSpent
					});
					newNoBudgetSpendings += cashFlow.amount;
				}
			}
		}
		for (const cashGroup of cashGroups) {
			if (!newProgressWithBudget.has(cashGroup.name) && cashGroup.budget !== null) {
				newProgressWithBudget.set(cashGroup.name, { spent: 0, limit: cashGroup.budget });
			}
		}
		const totalBudget = cashGroups.reduce((result, current) => {
			return result + (current?.budget ?? 0);
		}, 0);
		budgetProgress = { limit: totalBudget, spent: totalSpent };
		noBudgetSpendings = newNoBudgetSpendings;
		progressWithBudget = sortBudgets(newProgressWithBudget);
		progressNoBudget = sortBudgets(newProgressNoBudget);
	}

	function sortBudgets(progresses: BudgetProgressMap): BudgetProgressMap {
		return new Map(
			[...progresses].sort((a, b) => {
				const aSpent = a[1]?.spent ?? 0;
				const bSpent = b[1]?.spent ?? 0;
				return bSpent - aSpent;
			})
		);
	}
</script>

{#if tableOpenStates}
	<div class="carousel w-full">
		<div id="item1" class="carousel-item box-border w-full p-1 py-2">
			<div class="w-full">
				<ul class="flex flex-col gap-4 pb-4">
					{#each [...progressWithBudget] as [name, info]}
						<ProgressElement {name} {info} />
					{/each}
				</ul>
				<div class="border-t border-dashed py-2">
					<ProgressElement
						fontBold
						name="Alle Budgets"
						info={{ limit: budgetProgress.limit, spent: budgetProgress.spent }}
					/>
				</div>
			</div>
		</div>
		<div id="item2" class="carousel-item box-border w-full p-1 py-2">
			<div class="w-full">
				<TotalSection bind:open={tableOpenStates.incomes}>
					<div slot="title">Einnahmen</div>
					<span slot="total">
						{displayCurrency({ amount: totalTableData.incomes, sign: '+' })}</span
					>
				</TotalSection>
				<TotalSection bind:open={tableOpenStates.expenses}>
					<div slot="title">Ausgaben</div>
					<span slot="total"> {displayCurrency({ amount: totalTableData.expenses.total })}</span>
					<span slot="content">
						<TotalSection bind:open={tableOpenStates.fixedCosts}>
							<div slot="title">Fixkosten</div>
							<span slot="total">
								{displayCurrency({ amount: totalTableData.expenses.fixedCosts.total })}</span
							>
							<span slot="content">
								{#each Array.from(totalTableData.expenses.fixedCosts.fixedBudgets) as [name, amount]}
									<TotalItem>
										<span>{name}</span>
										<span>{displayCurrency({ amount })}</span>
									</TotalItem>
								{/each}
							</span>
						</TotalSection>
						<TotalSection bind:open={tableOpenStates.budgets}>
							<div slot="title">In Budgets</div>
							<span slot="total">
								{displayCurrency({ amount: totalTableData.expenses.budgets.total })}</span
							>
							<span slot="content">
								{#each Array.from(totalTableData.expenses.budgets.budgets) as [name, amount]}
									<TotalItem>
										<span>{name}</span>
										<span>{displayCurrency({ amount })}</span>
									</TotalItem>
								{/each}
							</span>
						</TotalSection>
						<TotalSection bind:open={tableOpenStates.noBudgets}>
							<div slot="title">Ohne Budget</div>
							<span slot="total">
								{displayCurrency({ amount: totalTableData.expenses.noBudgets.total })}</span
							>
							<span slot="content">
								{#each Array.from(totalTableData.expenses.noBudgets.budgets) as [name, amount]}
									<TotalItem>
										<span>{name}</span>
										<span>{displayCurrency({ amount })}</span>
									</TotalItem>
								{/each}
							</span>
						</TotalSection>
					</span>
				</TotalSection>
				<SumItem>
					<span>Total</span>
					<span
						>{displayCurrency({
							amount: totalTableData.incomes - totalTableData.expenses.total
						})}</span
					>
				</SumItem>
			</div>
			<!-- <div class="flex w-full flex-col">
			<div class="flex flex-row justify-between border-b border-dashed pb-3 font-medium">
				<span>Einnahmen</span>
				<Obfuscate>
					<span>{displayCurrency({ amount: totalIncome, forceDecimals: true })}</span>
				</Obfuscate>
			</div>
			<div class="flex flex-row justify-between border-b border-t border-dashed py-3 font-medium">
				<span>Ausgaben</span>
				<span>{displayCurrency({ amount: totalSpent, sign: '- ', forceDecimals: true })}</span>
			</div>
			{#if totalFixCost > 0}
				<div class="flex flex-row justify-between border-b border-dashed py-3 pl-4 font-normal">
					<span>Fixkosten</span>
					<span>{displayCurrency({ amount: totalFixCost, sign: '-', forceDecimals: true })}</span>
				</div>
			{/if}
			{#if budgetProgress.spent > 0}
				<div class="flex flex-row justify-between border-b border-dashed py-3 pl-4 font-normal">
					<span>Ausgaben in Budgets</span>
					<span
						>{displayCurrency({
							amount: budgetProgress.spent,
							sign: '-',
							forceDecimals: true
						})}</span
					>
				</div>
			{/if}
			{#if noBudgetSpendings > 0}
				<div class="flex flex-row justify-between border-b border-dashed py-3 pl-4 font-normal">
					<span>Ausgaben ohne Budget</span>
					<span
						>{displayCurrency({
							amount: noBudgetSpendings,
							sign: '-',
							forceDecimals: true
						})}</span
					>
				</div>
			{/if}
			<div class="flex flex-row justify-between border-b border-dashed py-3 font-medium">
				<span>Total</span>
				<Obfuscate>
					<span
						>{displayCurrency({
							amount: total,
							forceDecimals: true
						})}</span
					>
				</Obfuscate>
			</div>
		</div> -->
		</div>
	</div>
{/if}
