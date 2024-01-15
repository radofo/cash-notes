<script lang="ts">
	import type { BudgetProgress, BudgetProgressMap } from '../types/budget';
	import type { CashFlow, CashGroup } from '../types/supabase';
	import { displayCurrency, formatCurrency } from '../utils/currency';
	import ProgressElement from './ProgressElement.svelte';

	export let cashGroups: CashGroup[];
	export let cashFlows: CashFlow[];
	export let fixCostTotal: number;
	export let totalIncome: number;

	let progressWithBudget: Map<string, BudgetProgress>;
	let progressNoBudget: Map<string, BudgetProgress>;
	let budgetProgress: BudgetProgress;
	let noBudgetSpendings: number;

	$: totalSpent = budgetProgress.spent + noBudgetSpendings + fixCostTotal;
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
			if (!newProgressWithBudget.has(cashGroup.name) && cashGroup.budget) {
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

<div class="carousel w-full">
	<div id="item1" class="carousel-item flex w-full flex-col">
		<div class="w-full rounded-lg">
			<ul class="flex flex-col gap-4 py-4">
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
	<div id="item2" class="carousel-item w-full">
		<div class="flex w-full flex-col px-3">
			{#if totalIncome > 0}
				<div class="flex flex-row justify-between border-b border-dashed py-3 font-medium">
					<span>Einnahmen</span>
					<span>{displayCurrency({ amount: totalIncome, forceDecimals: true })}</span>
				</div>
			{/if}
			<div class="flex flex-row justify-between border-b border-t border-dashed py-3 font-medium">
				<span>Ausgaben</span>
				<span>{displayCurrency({ amount: totalSpent, sign: '- ' })}</span>
			</div>
			{#if fixCostTotal > 0}
				<div class="flex flex-row justify-between border-b border-dashed py-3 pl-4 font-normal">
					<span>Fixkosten</span>
					<span>{displayCurrency({ amount: fixCostTotal, sign: '-', forceDecimals: true })}</span>
				</div>
			{/if}
			{#if budgetProgress.spent > 0}
				<div class="flex flex-row justify-between border-b border-dashed py-3 pl-4 font-normal">
					<span>Ausgaben aus Budgets</span>
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
				<span>{total < 0 ? 'Aktuelles Defizit' : 'Aktueller Überschuss'}</span>
				<span
					>{displayCurrency({
						amount: total
					})}</span
				>
			</div>
		</div>
	</div>
</div>

<!-- {#if fixCostTotal > 0 || noBudgetSpendings > 0}
		{#if noBudgetSpendings > 0}
			<div class="flex flex-col gap-2 border-t border-dashed pt-3">
				<ul class="flex flex-col gap-4">
					{#each [...progressNoBudget] as [name, info]}
						<div class="flex w-full items-center justify-between">
							<span>{name}</span>
							<span>{displayCurrency({ amount: info.spent })}</span>
						</div>
					{/each}
				</ul>
			</div>
		{/if}
		{#if fixCostTotal > 0}
			<div class="flex flex-row justify-between gap-2 border-t border-dashed pt-3">
				<span>Fixkosten</span>
				<span>{displayCurrency({ amount: fixCostTotal })}</span>
			</div>
		{/if}
		<div class="flex flex-row justify-between gap-2 border-t border-dashed pt-3 font-medium">
			<span>Insg. Einnahmen</span>
			<span>{displayCurrency({ amount: totalIncome })}</span>
		</div>
		<div class="flex flex-row justify-between gap-2 border-t border-dashed pt-3 font-medium">
			<span>Insg. Ausgaben</span>
			<span
				>{displayCurrency({
					amount: budgetProgress.spent + noBudgetSpendings + fixCostTotal
				})}</span
			>
		</div>
		<div class="flex flex-row justify-between gap-2 border-t border-dashed pt-3 font-medium">
			<span>Aktueller Überschuss</span>
			<span
				>{displayCurrency({
					amount: totalIncome - (budgetProgress.spent + noBudgetSpendings + fixCostTotal)
				})}</span
			>
		</div>
	{/if} -->
