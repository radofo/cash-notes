<script lang="ts">
	import { displayCurrency } from '../utils/currency';
	import ListItem from './ListItem.svelte';
	import ListSection from './ListSection.svelte';

	export let totalEarnings: number;
	export let totalSpendings: number;
	export let fixCost: number = 200;
	export let budgetedCost: number = 500;
	export let savings: number;
</script>

<ListSection heading="Total">
	<ListItem itemType="main">
		<span>Total Einnahmen</span>
		<span>{displayCurrency({ amount: totalEarnings, forceDecimals: true })} </span>
	</ListItem>
	<ListItem itemType="main">
		<span>Total Ausgaben</span>
		<span>{displayCurrency({ amount: totalSpendings, sign: '-', forceDecimals: true })} </span>
	</ListItem>
	<ListItem itemType="sub">
		<span>Fixkosten</span>
		<span>{displayCurrency({ amount: fixCost, sign: '-', forceDecimals: true })} </span>
	</ListItem>
	<ListItem itemType="sub">
		<span>Monatliche Budgets</span>
		<span>{displayCurrency({ amount: budgetedCost, sign: '-', forceDecimals: true })} </span>
	</ListItem>
	<ListItem itemType="main">
		<span>Überschuss</span>
		<span>{displayCurrency({ amount: savings, forceDecimals: true })}</span>
	</ListItem>
</ListSection>
