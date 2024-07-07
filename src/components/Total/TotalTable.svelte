<script lang="ts">
	import { onMount } from 'svelte';
	import type { TableOpenState } from '../../types/recurring';
	import { cashGroupStore, recCashFlowStore } from '../../utils/cashGroup.store';
	import { displayCurrency } from '../../utils/currency';
	import {
		getActiveTimeframe,
		getRecurringAmount,
		getTotalTableData,
		sortCashFlowsByAmount
	} from '../../utils/recurring';
	import SumItem from './SumItem.svelte';
	import TotalItem from './TotalItem.svelte';
	import TotalSection from './TotalSection.svelte';

	$: cashGroups = $cashGroupStore;
	$: activeCashGroups = cashGroups.filter((group) => group.is_active);
	$: recurring = $recCashFlowStore;
	$: activeRecurring = sortCashFlowsByAmount(
		recurring.filter((rec) => getActiveTimeframe(rec)?.amount !== null)
	);

	$: totalTableData = getTotalTableData(activeRecurring, activeCashGroups);
	let tableOpenStates: TableOpenState;

	onMount(() => {
		const fixedCostsBudgets: { [key: string]: boolean } = {};
		for (const [key, _] of totalTableData.expenses.fixedCosts.budgets) {
			fixedCostsBudgets[key] = false;
		}
		tableOpenStates = {
			incomes: true,
			expenses: true,
			fixedCosts: false,
			budgets: false,
			fixedCostsBudgets
		};
	});
</script>

{#if totalTableData && tableOpenStates}
	<div>
		<TotalSection bind:open={tableOpenStates.incomes}>
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
		<TotalSection bind:open={tableOpenStates.expenses}>
			<div slot="title">Ausgaben</div>
			<span slot="total"> {displayCurrency({ amount: totalTableData.expenses.total })} </span>
			<div slot="content">
				<TotalSection bind:open={tableOpenStates.fixedCosts}>
					<div slot="title">Fixkosten</div>
					<span slot="total">
						{displayCurrency({ amount: totalTableData.expenses.fixedCosts.total })}
					</span>
					<div slot="content">
						{#each Array.from(totalTableData.expenses.fixedCosts.budgets) as [name, recCashFlows]}
							<TotalSection bind:open={tableOpenStates.fixedCostsBudgets[name]}>
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
				<TotalSection bind:open={tableOpenStates.budgets}>
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
