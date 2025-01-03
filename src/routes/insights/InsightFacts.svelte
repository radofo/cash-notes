<script lang="ts">
	import { displayCurrency } from '../../utils/currency';
	import InsightSection from './InsightSection.svelte';

	export let totalSpendings: number;
	export let averageSpendings: number;
	export let averageSpendingsTotal: number;
	export let budget: number;
	export let isSingleMonth: boolean;
</script>

<InsightSection title="Übersicht">
	<div class="grid grid-cols-[auto,1fr] gap-2 text-sm">
		<p class="font-medium">Ausgaben Gesamt</p>
		<p class="pl-3">{displayCurrency({ amount: totalSpendings, forceDecimals: false })}</p>
		<p class="font-medium">Mtl. Budget</p>
		<p class="pl-3">{displayCurrency({ amount: budget, forceDecimals: false })}</p>
		{#if !isSingleMonth}
			<p class="font-medium">&Oslash; mtl. Ausgaben (alle Monate)</p>
			<p class="pl-3">{displayCurrency({ amount: averageSpendingsTotal, forceDecimals: false })}</p>
			<p class="font-medium">&Oslash; mtl. Ausgaben (ohne 0er Monate)</p>
			<p class="pl-3">{displayCurrency({ amount: averageSpendings, forceDecimals: false })}</p>
		{/if}
	</div>
</InsightSection>
