<script lang="ts">
	import { displayCurrency } from '../utils/currency';
	import ListItem from './ListItem.svelte';
	import Obfuscate from './Obfuscate.svelte';

	export let totalEarnings: number;
	export let totalSpendings: number;
	export let fixCost: number = 200;
	export let budgetedCost: number = 500;
	export let savings: number;
</script>

<div class="flex flex-col gap-2">
	<span class="block text-center text-lg font-semibold">Total</span>
	<ListItem itemType="main">
		<span>Total Einnahmen</span>
		<Obfuscate>
			<span>{displayCurrency({ amount: totalEarnings, forceDecimals: true })} </span>
		</Obfuscate>
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
		<span>Budgets</span>
		<span>{displayCurrency({ amount: budgetedCost, sign: '-', forceDecimals: true })} </span>
	</ListItem>
	<ListItem itemType="main">
		<span>Überschuss</span>
		<Obfuscate>
			<span>{displayCurrency({ amount: savings, forceDecimals: true })}</span>
		</Obfuscate>
	</ListItem>
</div>
