<script lang="ts">
	import { Equal } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { budgetViewMode } from '../stores/preferences';
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

	function toggleViewMode() {
		budgetViewMode.toggle();
	}

	export let recurring: RecCashFlow[];
	export let cashFlows: CashFlow[];
	export let month: Month;

	export let cashGroups: CashGroup[];
	export let totalFixCost: number;
	export let totalIncome: number;
	export let stackedLayout: boolean = false;

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
			expenses: true,
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
	{#if stackedLayout}
		<!-- Stacked layout for insights page -->
		<div class="flex w-full flex-col gap-8">
			<!-- Budget bars -->
			<div class="w-full">
				<ul class="flex flex-col gap-4 pb-4">
					{#each [...progressWithBudget] as [name, info]}
						<ProgressElement {name} {info} viewMode={$budgetViewMode} onClick={toggleViewMode} />
					{/each}
				</ul>
				<ProgressElement
					fontBold
					name="Alle Budgets"
					info={{ limit: budgetProgress.limit, spent: budgetProgress.spent }}
					viewMode={$budgetViewMode}
					onClick={toggleViewMode}
				/>
				{#if $budgetViewMode === 'remaining'}
					<div class="mt-1 text-right text-xs text-muted-foreground">übrig</div>
				{/if}
			</div>
			<!-- Income/Expense table -->
			<div class="w-full">
				<TotalSection bind:open={tableOpenStates.incomes}>
					<div slot="title">Einnahmen</div>
					<span slot="total">
						{displayCurrency({ amount: totalTableData.incomes, sign: '+' })}</span
					>
				</TotalSection>
				<TotalSection bind:open={tableOpenStates.expenses}>
					<div slot="title">Ausgaben</div>
					<span slot="total">
						{displayCurrency({ amount: totalTableData.expenses.total, sign: '-' })}</span
					>
					<span slot="content">
						<TotalSection bind:open={tableOpenStates.fixedCosts}>
							<div slot="title">Fixkosten</div>
							<span slot="total">
								{displayCurrency({
									amount: totalTableData.expenses.fixedCosts.total,
									sign: '-'
								})}</span
							>
							<span slot="content">
								{#each Array.from(totalTableData.expenses.fixedCosts.fixedBudgets) as [name, amount]}
									<TotalItem>
										<span>{name}</span>
										<span>{displayCurrency({ amount, sign: '-' })}</span>
									</TotalItem>
								{/each}
							</span>
						</TotalSection>
						<TotalSection bind:open={tableOpenStates.budgets}>
							<div slot="title">In Budgets</div>
							<span slot="total">
								{displayCurrency({
									amount: totalTableData.expenses.budgets.total,
									sign: '-'
								})}</span
							>
							<span slot="content">
								{#each Array.from(totalTableData.expenses.budgets.budgets) as [name, amount]}
									<TotalItem>
										<span>{name}</span>
										<span>{displayCurrency({ amount, sign: '-' })}</span>
									</TotalItem>
								{/each}
							</span>
						</TotalSection>
						<TotalSection bind:open={tableOpenStates.noBudgets}>
							<div slot="title">Ohne Budget</div>
							<span slot="total">
								{displayCurrency({
									amount: totalTableData.expenses.noBudgets.total,
									sign: '-'
								})}</span
							>
							<span slot="content">
								{#each Array.from(totalTableData.expenses.noBudgets.budgets) as [name, amount]}
									<TotalItem>
										<span>{name}</span>
										<span>{displayCurrency({ amount, sign: '-' })}</span>
									</TotalItem>
								{/each}
							</span>
						</TotalSection>
					</span>
				</TotalSection>
				<SumItem>
					<div class="flex flex-row items-center gap-2">
						<Equal class="h-5 w-5" />
						<span>Total</span>
					</div>
					<span
						>{displayCurrency({
							amount: Math.abs(totalTableData.incomes - totalTableData.expenses.total),
							sign: totalTableData.incomes - totalTableData.expenses.total < 0 ? '-' : '+'
						})}</span
					>
				</SumItem>
			</div>
		</div>
	{:else}
		<!-- Carousel layout for home page -->
		<div class="carousel w-full">
			<div id="item1" class="carousel-item box-border w-full py-2">
				<div class="w-full">
					<ul class="flex flex-col gap-4 pb-4">
						{#each [...progressWithBudget] as [name, info]}
							<ProgressElement {name} {info} viewMode={$budgetViewMode} onClick={toggleViewMode} />
						{/each}
					</ul>
					<ProgressElement
						fontBold
						name="Alle Budgets"
						info={{ limit: budgetProgress.limit, spent: budgetProgress.spent }}
						viewMode={$budgetViewMode}
						onClick={toggleViewMode}
					/>
					{#if $budgetViewMode === 'remaining'}
						<div class="mt-1 text-right text-xs text-muted-foreground">übrig</div>
					{/if}
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
						<span slot="total">
							{displayCurrency({ amount: totalTableData.expenses.total, sign: '-' })}</span
						>
						<span slot="content">
							<TotalSection bind:open={tableOpenStates.fixedCosts}>
								<div slot="title">Fixkosten</div>
								<span slot="total">
									{displayCurrency({
										amount: totalTableData.expenses.fixedCosts.total,
										sign: '-'
									})}</span
								>
								<span slot="content">
									{#each Array.from(totalTableData.expenses.fixedCosts.fixedBudgets) as [name, amount]}
										<TotalItem>
											<span>{name}</span>
											<span>{displayCurrency({ amount, sign: '-' })}</span>
										</TotalItem>
									{/each}
								</span>
							</TotalSection>
							<TotalSection bind:open={tableOpenStates.budgets}>
								<div slot="title">In Budgets</div>
								<span slot="total">
									{displayCurrency({
										amount: totalTableData.expenses.budgets.total,
										sign: '-'
									})}</span
								>
								<span slot="content">
									{#each Array.from(totalTableData.expenses.budgets.budgets) as [name, amount]}
										<TotalItem>
											<span>{name}</span>
											<span>{displayCurrency({ amount, sign: '-' })}</span>
										</TotalItem>
									{/each}
								</span>
							</TotalSection>
							<TotalSection bind:open={tableOpenStates.noBudgets}>
								<div slot="title">Ohne Budget</div>
								<span slot="total">
									{displayCurrency({
										amount: totalTableData.expenses.noBudgets.total,
										sign: '-'
									})}</span
								>
								<span slot="content">
									{#each Array.from(totalTableData.expenses.noBudgets.budgets) as [name, amount]}
										<TotalItem>
											<span>{name}</span>
											<span>{displayCurrency({ amount, sign: '-' })}</span>
										</TotalItem>
									{/each}
								</span>
							</TotalSection>
						</span>
					</TotalSection>
					<SumItem>
						<div class="flex flex-row items-center gap-2">
							<Equal class="h-5 w-5" />
							<span>Total</span>
						</div>
						<span
							>{displayCurrency({
								amount: Math.abs(totalTableData.incomes - totalTableData.expenses.total),
								sign: totalTableData.incomes - totalTableData.expenses.total < 0 ? '-' : '+'
							})}</span
						>
					</SumItem>
				</div>
			</div>
		</div>
	{/if}
{/if}
